import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const characteristicsSchema = z.object({
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
});

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { role?: string }).role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = characteristicsSchema.parse(body);

    await prisma.studentCharacteristics.upsert({
      where: { studentId: session.user.id },
      create: {
        studentId: session.user.id,
        ...parsed,
      },
      update: parsed,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
