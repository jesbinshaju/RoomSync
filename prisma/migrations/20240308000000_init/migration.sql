-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "roll_number" VARCHAR(30) NOT NULL,
    "phone_number" VARCHAR(15),
    "department" VARCHAR(100) NOT NULL,
    "year_of_study" INTEGER,
    "gender" VARCHAR(10),
    "profile_photo" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_characteristics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "academic_major" VARCHAR(100) NOT NULL,
    "study_hours_per_day" INTEGER NOT NULL,
    "study_time_preference" VARCHAR(20) NOT NULL,
    "academic_goal" VARCHAR(20) NOT NULL,
    "sleep_time" VARCHAR(20) NOT NULL,
    "wake_time" VARCHAR(20) NOT NULL,
    "nap_frequency" VARCHAR(20) NOT NULL,
    "hobbies" TEXT[] DEFAULT '{}',
    "cleanliness_level" INTEGER NOT NULL,
    "noise_tolerance" INTEGER NOT NULL,
    "social_level" INTEGER NOT NULL,
    "guest_frequency" VARCHAR(20) NOT NULL,
    "smoking" BOOLEAN NOT NULL DEFAULT false,
    "drinking" BOOLEAN NOT NULL DEFAULT false,
    "diet_type" VARCHAR(20) NOT NULL,
    "food_in_room" BOOLEAN NOT NULL DEFAULT true,
    "ac_preference" VARCHAR(20) NOT NULL,
    "light_sensitivity" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_characteristics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_blocks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "block_name" VARCHAR(10) NOT NULL,
    "gender" VARCHAR(10),
    "total_floors" INTEGER NOT NULL,
    "warden_name" VARCHAR(100),
    "warden_phone" VARCHAR(15),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hostel_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "block_id" UUID NOT NULL,
    "room_number" VARCHAR(10) NOT NULL,
    "floor_number" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 3,
    "room_type" VARCHAR(20) NOT NULL,
    "has_ac" BOOLEAN NOT NULL DEFAULT false,
    "has_attached_bathroom" BOOLEAN NOT NULL DEFAULT false,
    "has_balcony" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_allocations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "allocated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allocated_by" VARCHAR(20) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "vacated_at" TIMESTAMPTZ,
    "academic_year" VARCHAR(10) NOT NULL,

    CONSTRAINT "room_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compatibility_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_a_id" UUID NOT NULL,
    "student_b_id" UUID NOT NULL,
    "total_score" DECIMAL(5,2) NOT NULL,
    "academic_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "sleep_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "hobby_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "lifestyle_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "food_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "environment_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "computed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compatibility_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_fee_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_name" VARCHAR(100) NOT NULL,
    "room_type" VARCHAR(20) NOT NULL,
    "academic_year" VARCHAR(10) NOT NULL,
    "annual_fee" DECIMAL(10,2) NOT NULL,
    "security_deposit" DECIMAL(10,2) NOT NULL DEFAULT 5000,
    "mess_fee_monthly" DECIMAL(10,2) NOT NULL DEFAULT 2500,
    "late_fine_per_day" DECIMAL(6,2) NOT NULL DEFAULT 50,
    "includes_ac" BOOLEAN NOT NULL DEFAULT false,
    "includes_wifi" BOOLEAN NOT NULL DEFAULT true,
    "includes_laundry" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hostel_fee_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "room_id" UUID,
    "fee_plan_id" UUID,
    "invoice_number" VARCHAR(30) NOT NULL,
    "academic_year" VARCHAR(10) NOT NULL,
    "semester" INTEGER,
    "base_amount" DECIMAL(10,2) NOT NULL,
    "mess_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fine_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "due_date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "student_id" UUID,
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "payment_method" VARCHAR(30),
    "transaction_ref" VARCHAR(100),
    "payment_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_by" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_change_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "current_room_id" UUID NOT NULL,
    "requested_room_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "admin_remarks" TEXT,
    "requested_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ,

    CONSTRAINT "room_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "block_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- Add constraints
ALTER TABLE "students" ADD CONSTRAINT "students_email_key" UNIQUE ("email");
ALTER TABLE "students" ADD CONSTRAINT "students_roll_number_key" UNIQUE ("roll_number");
ALTER TABLE "students" ADD CONSTRAINT "students_year_of_study_check" CHECK ("year_of_study" >= 1 AND "year_of_study" <= 5);
ALTER TABLE "students" ADD CONSTRAINT "students_gender_check" CHECK ("gender" IN ('male', 'female', 'other'));

ALTER TABLE "student_characteristics" ADD CONSTRAINT "student_characteristics_student_id_key" UNIQUE ("student_id");
ALTER TABLE "student_characteristics" ADD CONSTRAINT "student_characteristics_study_hours_check" CHECK ("study_hours_per_day" >= 0 AND "study_hours_per_day" <= 16);
ALTER TABLE "student_characteristics" ADD CONSTRAINT "student_characteristics_cleanliness_check" CHECK ("cleanliness_level" >= 1 AND "cleanliness_level" <= 5);
ALTER TABLE "student_characteristics" ADD CONSTRAINT "student_characteristics_noise_check" CHECK ("noise_tolerance" >= 1 AND "noise_tolerance" <= 5);
ALTER TABLE "student_characteristics" ADD CONSTRAINT "student_characteristics_social_check" CHECK ("social_level" >= 1 AND "social_level" <= 5);

ALTER TABLE "hostel_blocks" ADD CONSTRAINT "hostel_blocks_block_name_key" UNIQUE ("block_name");
ALTER TABLE "hostel_blocks" ADD CONSTRAINT "hostel_blocks_gender_check" CHECK ("gender" IN ('male', 'female', 'mixed'));

ALTER TABLE "rooms" ADD CONSTRAINT "rooms_status_check" CHECK ("status" IN ('available', 'partially_filled', 'full', 'maintenance'));
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_room_type_check" CHECK ("room_type" IN ('standard', 'premium', 'deluxe'));
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_block_room_unique" UNIQUE ("block_id", "room_number");

ALTER TABLE "room_allocations" ADD CONSTRAINT "room_allocations_student_id_key" UNIQUE ("student_id");
ALTER TABLE "room_allocations" ADD CONSTRAINT "room_allocations_allocated_by_check" CHECK ("allocated_by" IN ('algorithm', 'admin', 'manual'));

ALTER TABLE "compatibility_scores" ADD CONSTRAINT "compatibility_scores_unique" UNIQUE ("student_a_id", "student_b_id");
ALTER TABLE "compatibility_scores" ADD CONSTRAINT "compatibility_scores_diff_check" CHECK ("student_a_id" <> "student_b_id");

ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_invoice_number_key" UNIQUE ("invoice_number");
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_semester_check" CHECK ("semester" IS NULL OR ("semester" = 1 OR "semester" = 2));
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_status_check" CHECK ("status" IN ('pending', 'partial', 'paid', 'overdue', 'waived'));

ALTER TABLE "room_change_requests" ADD CONSTRAINT "room_change_requests_status_check" CHECK ("status" IN ('pending', 'approved', 'rejected', 'withdrawn'));

ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_email_key" UNIQUE ("email");
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_role_check" CHECK ("role" IN ('superadmin', 'warden', 'accounts', 'staff'));

-- Add foreign keys
ALTER TABLE "student_characteristics" ADD CONSTRAINT "student_characteristics_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "hostel_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "room_allocations" ADD CONSTRAINT "room_allocations_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "room_allocations" ADD CONSTRAINT "room_allocations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "compatibility_scores" ADD CONSTRAINT "compatibility_scores_student_a_id_fkey" FOREIGN KEY ("student_a_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "compatibility_scores" ADD CONSTRAINT "compatibility_scores_student_b_id_fkey" FOREIGN KEY ("student_b_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_fee_plan_id_fkey" FOREIGN KEY ("fee_plan_id") REFERENCES "hostel_fee_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "fee_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "room_change_requests" ADD CONSTRAINT "room_change_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "room_change_requests" ADD CONSTRAINT "room_change_requests_current_room_id_fkey" FOREIGN KEY ("current_room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "room_change_requests" ADD CONSTRAINT "room_change_requests_requested_room_id_fkey" FOREIGN KEY ("requested_room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "hostel_blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX "idx_room_allocations_room_id" ON "room_allocations"("room_id") WHERE "is_active" = true;
CREATE INDEX "idx_room_allocations_student" ON "room_allocations"("student_id") WHERE "is_active" = true;
CREATE INDEX "idx_compat_a" ON "compatibility_scores"("student_a_id", "total_score" DESC);
CREATE INDEX "idx_compat_b" ON "compatibility_scores"("student_b_id", "total_score" DESC);
CREATE INDEX "idx_fee_invoices_student" ON "fee_invoices"("student_id", "status");
CREATE INDEX "idx_fee_invoices_due" ON "fee_invoices"("due_date") WHERE "status" IN ('pending', 'partial', 'overdue');
