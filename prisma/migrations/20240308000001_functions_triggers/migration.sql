-- Compatibility calculation function
CREATE OR REPLACE FUNCTION calculate_compatibility(
  student_a UUID,
  student_b UUID
) RETURNS NUMERIC AS $$
DECLARE
  a student_characteristics%ROWTYPE;
  b student_characteristics%ROWTYPE;
  score NUMERIC := 0;
  shared_hobbies INT;
BEGIN
  SELECT * INTO a FROM student_characteristics WHERE student_id = student_a;
  SELECT * INTO b FROM student_characteristics WHERE student_id = student_b;

  IF a.id IS NULL OR b.id IS NULL THEN
    RETURN 0;
  END IF;

  -- ACADEMIC (25 pts)
  IF a.academic_major = b.academic_major THEN score := score + 15; END IF;
  IF a.study_time_preference = b.study_time_preference THEN score := score + 6; END IF;
  IF ABS(a.study_hours_per_day - b.study_hours_per_day) <= 2 THEN score := score + 4; END IF;

  -- SLEEP (25 pts)
  IF a.sleep_time = b.sleep_time THEN score := score + 15; END IF;
  IF a.wake_time = b.wake_time THEN score := score + 7; END IF;
  IF a.nap_frequency = b.nap_frequency THEN score := score + 3; END IF;

  -- HOBBIES (20 pts)
  SELECT COALESCE(array_length(ARRAY(SELECT unnest(a.hobbies) INTERSECT SELECT unnest(b.hobbies)), 1), 0) INTO shared_hobbies;
  IF shared_hobbies >= 3 THEN score := score + 20;
  ELSIF shared_hobbies = 2 THEN score := score + 14;
  ELSIF shared_hobbies = 1 THEN score := score + 7;
  END IF;

  -- LIFESTYLE (20 pts)
  IF ABS(a.cleanliness_level - b.cleanliness_level) <= 1 THEN score := score + 6; END IF;
  IF ABS(a.noise_tolerance - b.noise_tolerance) <= 1 THEN score := score + 6; END IF;
  IF ABS(a.social_level - b.social_level) <= 1 THEN score := score + 4; END IF;
  IF a.guest_frequency = b.guest_frequency THEN score := score + 2; END IF;
  IF a.smoking = b.smoking THEN score := score + 1; END IF;
  IF a.drinking = b.drinking THEN score := score + 1; END IF;

  -- FOOD (5 pts)
  IF a.diet_type = b.diet_type THEN score := score + 3; END IF;
  IF a.food_in_room = b.food_in_room THEN score := score + 2; END IF;

  -- ENVIRONMENT (5 pts)
  IF a.ac_preference = b.ac_preference THEN score := score + 3; END IF;
  IF a.light_sensitivity = b.light_sensitivity THEN score := score + 2; END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Update room status trigger
CREATE OR REPLACE FUNCTION update_room_status()
RETURNS TRIGGER AS $$
DECLARE occupancy INT;
BEGIN
  SELECT COUNT(*)::INT INTO occupancy
  FROM room_allocations
  WHERE room_id = COALESCE(NEW.room_id, OLD.room_id) AND is_active = true;

  UPDATE rooms SET status =
    CASE
      WHEN occupancy = 0 THEN 'available'
      WHEN occupancy < 3 THEN 'partially_filled'
      ELSE 'full'
    END
  WHERE id = COALESCE(NEW.room_id, OLD.room_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_room_status ON room_allocations;
CREATE TRIGGER trg_update_room_status
AFTER INSERT OR UPDATE OR DELETE ON room_allocations
FOR EACH ROW EXECUTE FUNCTION update_room_status();

-- Generate fee invoice trigger
CREATE OR REPLACE FUNCTION generate_fee_invoice()
RETURNS TRIGGER AS $$
DECLARE
  plan hostel_fee_plans%ROWTYPE;
  current_semester INT;
  current_year VARCHAR(10);
BEGIN
  SELECT fp.* INTO plan
  FROM hostel_fee_plans fp
  JOIN rooms r ON r.room_type = fp.room_type
  WHERE r.id = NEW.room_id AND fp.is_active = true
  LIMIT 1;

  IF plan.id IS NULL THEN
    RETURN NEW;
  END IF;

  current_year := to_char(NOW(), 'YYYY') || '-' || to_char(NOW() + INTERVAL '1 year', 'YY');
  current_semester := CASE WHEN EXTRACT(MONTH FROM NOW()) <= 6 THEN 1 ELSE 2 END;

  INSERT INTO fee_invoices (
    student_id, room_id, fee_plan_id, invoice_number,
    academic_year, semester, base_amount, mess_amount, due_date, status
  ) VALUES (
    NEW.student_id, NEW.room_id, plan.id,
    'INV-' || to_char(NOW(), 'YYYYMMDD') || '-' || substring(NEW.student_id::text, 1, 8),
    current_year, current_semester,
    plan.annual_fee / 2, plan.mess_fee_monthly * 6,
    (NOW() + INTERVAL '30 days')::DATE, 'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_invoice ON room_allocations;
CREATE TRIGGER trg_generate_invoice
AFTER INSERT ON room_allocations
FOR EACH ROW WHEN (NEW.is_active = true)
EXECUTE FUNCTION generate_fee_invoice();

-- Recompute compatibility trigger
CREATE OR REPLACE FUNCTION recompute_compatibility()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM compatibility_scores
  WHERE student_a_id = NEW.student_id OR student_b_id = NEW.student_id;

  INSERT INTO compatibility_scores (student_a_id, student_b_id, total_score)
  SELECT NEW.student_id, sc.student_id, calculate_compatibility(NEW.student_id, sc.student_id)
  FROM student_characteristics sc
  WHERE sc.student_id <> NEW.student_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recompute_on_update ON student_characteristics;
CREATE TRIGGER trg_recompute_on_update
AFTER INSERT OR UPDATE ON student_characteristics
FOR EACH ROW EXECUTE FUNCTION recompute_compatibility();

-- Mark overdue invoices function (call via cron)
CREATE OR REPLACE FUNCTION mark_overdue_invoices() RETURNS void AS $$
BEGIN
  UPDATE fee_invoices fi
  SET
    status = 'overdue',
    fine_amount = fi.fine_amount + COALESCE((
      SELECT hfp.late_fine_per_day * (CURRENT_DATE - fi.due_date)
      FROM hostel_fee_plans hfp WHERE hfp.id = fi.fee_plan_id
    ), 0)
  WHERE status IN ('pending', 'partial') AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Room capacity check trigger
CREATE OR REPLACE FUNCTION check_room_capacity()
RETURNS TRIGGER AS $$
DECLARE current_count INT;
BEGIN
  SELECT COUNT(*)::INT INTO current_count
  FROM room_allocations
  WHERE room_id = NEW.room_id AND is_active = true;

  IF current_count >= (SELECT capacity FROM rooms WHERE id = NEW.room_id) THEN
    RAISE EXCEPTION 'Room is at full capacity';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_room_capacity ON room_allocations;
CREATE TRIGGER trg_check_room_capacity
BEFORE INSERT ON room_allocations
FOR EACH ROW WHEN (NEW.is_active = true)
EXECUTE FUNCTION check_room_capacity();
