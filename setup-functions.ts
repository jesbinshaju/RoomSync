import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setupFunctions() {
  console.log("\n=== SETTING UP FUNCTIONS ===\n");
  
  try {
    // Create the calculate_compatibility function
    await prisma.$executeRaw`
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
    `;
    console.log("✓ Created calculate_compatibility function");
    
    // Create the recompute_compatibility trigger function
    await prisma.$executeRaw`
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
    `;
    console.log("✓ Created recompute_compatibility function");
    
    // Create the trigger
    await prisma.$executeRaw`
      DROP TRIGGER IF EXISTS trg_recompute_on_update ON student_characteristics;
    `;
    
    await prisma.$executeRaw`
      CREATE TRIGGER trg_recompute_on_update
      AFTER INSERT OR UPDATE ON student_characteristics
      FOR EACH ROW EXECUTE FUNCTION recompute_compatibility();
    `;
    console.log("✓ Created trigger trg_recompute_on_update");
    
    console.log("\n✓ Functions and triggers created successfully!");
    
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

setupFunctions();
