import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  rollNumber: z.string().min(1).max(30),
  phoneNumber: z.string().optional(),
  department: z.string().min(1).max(100),
  yearOfStudy: z.number().min(1).max(5).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  characteristics: z.object({
    academicMajor: z.string(),
    studyHoursPerDay: z.number().min(0).max(16),
    studyTimePreference: z.enum(["morning", "afternoon", "evening", "night"]),
    academicGoal: z.enum(["top_grades", "balanced", "pass_only"]),
    sleepTime: z.enum(["before_10pm", "around_midnight", "after_1am"]),
    wakeTime: z.enum(["before_6am", "6am_to_8am", "after_8am"]),
    napFrequency: z.enum(["never", "sometimes", "daily"]),
    hobbies: z.array(z.string()).max(5),
    cleanlinessLevel: z.number().min(1).max(5),
    noiseTolerance: z.number().min(1).max(5),
    socialLevel: z.number().min(1).max(5),
    guestFrequency: z.enum(["never", "rarely", "often"]),
    smoking: z.boolean(),
    drinking: z.boolean(),
    dietType: z.enum(["vegetarian", "non_vegetarian", "vegan", "no_preference"]),
    foodInRoom: z.boolean(),
    acPreference: z.enum(["always_on", "sometimes", "prefer_off"]),
    lightSensitivity: z.enum(["light_sleeper", "moderate", "heavy_sleeper"]),
  }),
});

export async function POST(req: Request) {
  try {
    console.log("=== REGISTRATION REQUEST STARTED ===");
    const body = await req.json();
    console.log("Request body received:", {
      fullName: body.fullName,
      email: body.email,
      rollNumber: body.rollNumber,
      department: body.department,
    });

    const parsed = registerSchema.parse(body);
    console.log("Validation passed");

    console.log("Checking for existing user...");
    const existing = await prisma.student.findFirst({
      where: {
        OR: [{ email: parsed.email }, { rollNumber: parsed.rollNumber }],
      },
    });
    if (existing) {
      console.log("User already exists");
      return NextResponse.json(
        { error: "Email or roll number already registered" },
        { status: 400 }
      );
    }

    console.log("Hashing password...");
    const passwordHash = await hash(parsed.password, 12);

    console.log("Creating student record...");
    const student = await prisma.student.create({
      data: {
        fullName: parsed.fullName,
        email: parsed.email,
        passwordHash,
        rollNumber: parsed.rollNumber,
        phoneNumber: parsed.phoneNumber,
        department: parsed.department,
        yearOfStudy: parsed.yearOfStudy,
        gender: parsed.gender,
        characteristics: {
          create: {
            academicMajor: parsed.characteristics.academicMajor,
            studyHoursPerDay: parsed.characteristics.studyHoursPerDay,
            studyTimePreference: parsed.characteristics.studyTimePreference,
            academicGoal: parsed.characteristics.academicGoal,
            sleepTime: parsed.characteristics.sleepTime,
            wakeTime: parsed.characteristics.wakeTime,
            napFrequency: parsed.characteristics.napFrequency,
            hobbies: parsed.characteristics.hobbies,
            cleanlinessLevel: parsed.characteristics.cleanlinessLevel,
            noiseTolerance: parsed.characteristics.noiseTolerance,
            socialLevel: parsed.characteristics.socialLevel,
            guestFrequency: parsed.characteristics.guestFrequency,
            smoking: parsed.characteristics.smoking,
            drinking: parsed.characteristics.drinking,
            dietType: parsed.characteristics.dietType,
            foodInRoom: parsed.characteristics.foodInRoom,
            acPreference: parsed.characteristics.acPreference,
            lightSensitivity: parsed.characteristics.lightSensitivity,
          },
        },
      },
    });

    console.log("Student created successfully:", student.id);
    return NextResponse.json({
      id: student.id,
      email: student.email,
      message: "Registration successful",
    });
  } catch (e) {
    console.error("=== REGISTRATION ERROR ===");
    console.error("Error type:", e instanceof Error ? e.constructor.name : typeof e);
    console.error("Full error:", e);
    
    if (e instanceof z.ZodError) {
      const formatted = e.errors.map((err) => {
        const path = err.path.join(".");
        return `${path}: ${err.message}`;
      });
      console.error("Validation errors:", formatted);
      return NextResponse.json(
        { error: "Validation failed", details: formatted },
        { status: 400 }
      );
    }
    
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    console.error("Error message:", errorMsg);
    return NextResponse.json(
      { error: "Registration failed", details: errorMsg },
      { status: 500 }
    );
  }
}
