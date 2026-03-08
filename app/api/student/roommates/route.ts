import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { role?: string }).role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allocation = await prisma.roomAllocation.findFirst({
    where: { studentId: session.user.id, isActive: true },
    include: { room: true },
  });

  if (!allocation) {
    return NextResponse.json({ roommates: [], compatibility: [] });
  }

  const roommateAllocations = await prisma.roomAllocation.findMany({
    where: {
      roomId: allocation.roomId,
      studentId: { not: session.user.id },
      isActive: true,
    },
    include: { student: { include: { characteristics: true } } },
  });

  const compatibility = await prisma.compatibilityScore.findMany({
    where: {
      OR: [
        { studentAId: session.user.id, studentBId: { in: roommateAllocations.map((r) => r.studentId) } },
        { studentBId: session.user.id, studentAId: { in: roommateAllocations.map((r) => r.studentId) } },
      ],
    },
  });

  const roommates = roommateAllocations.map((r) => ({
    id: r.student.id,
    fullName: r.student.fullName,
    department: r.student.department,
    yearOfStudy: r.student.yearOfStudy,
    characteristics: r.student.characteristics
      ? {
          academicMajor: r.student.characteristics.academicMajor,
          hobbies: r.student.characteristics.hobbies,
        }
      : null,
  }));

  const compatMap = compatibility.map((c) => ({
    studentId: c.studentAId === session.user.id ? c.studentBId : c.studentAId,
    totalScore: Number(c.totalScore),
    academicScore: Number(c.academicScore),
    sleepScore: Number(c.sleepScore),
    hobbyScore: Number(c.hobbyScore),
    lifestyleScore: Number(c.lifestyleScore),
    foodScore: Number(c.foodScore),
    environmentScore: Number(c.environmentScore),
  }));

  return NextResponse.json({ roommates, compatibility: compatMap });
}
