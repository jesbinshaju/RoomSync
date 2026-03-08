import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getAcademicYear } from "@/lib/fees";
import { z } from "zod";

const schema = z.object({
  studentId: z.string().uuid(),
  roomId: z.string().uuid(),
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { studentId, roomId } = schema.parse(body);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { characteristics: true },
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const existing = await prisma.roomAllocation.findFirst({
      where: { studentId, isActive: true },
    });
    if (existing) return NextResponse.json({ error: "Student already has a room" }, { status: 400 });

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { block: true, allocations: { where: { isActive: true } } },
    });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (room.allocations.length >= 3) return NextResponse.json({ error: "Room is full" }, { status: 400 });

    if (student.gender && room.block.gender && room.block.gender !== "mixed" && room.block.gender !== student.gender) {
      return NextResponse.json({ error: "Room gender does not match student" }, { status: 400 });
    }

    await prisma.roomAllocation.create({
      data: {
        studentId,
        roomId,
        allocatedBy: "admin",
        academicYear: getAcademicYear(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Assignment failed" }, { status: 500 });
  }
}
