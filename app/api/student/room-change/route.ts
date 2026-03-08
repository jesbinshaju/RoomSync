import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPendingFees } from "@/lib/fees";
import { z } from "zod";

const requestSchema = z.object({
  requestedRoomId: z.string().uuid(),
  reason: z.string().min(10),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { role?: string }).role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasPending = await hasPendingFees(session.user.id);
  if (hasPending) {
    return NextResponse.json(
      { error: "Cannot request room change while you have pending or overdue fees" },
      { status: 400 }
    );
  }

  const allocation = await prisma.roomAllocation.findFirst({
    where: { studentId: session.user.id, isActive: true },
  });
  if (!allocation) {
    return NextResponse.json({ error: "No active room allocation" }, { status: 400 });
  }

  const existing = await prisma.roomChangeRequest.findFirst({
    where: { studentId: session.user.id, status: "pending" },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have a pending room change request" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = requestSchema.parse(body);

    const requestedRoom = await prisma.room.findUnique({
      where: { id: parsed.requestedRoomId },
      include: { block: true, allocations: { where: { isActive: true } } },
    });

    if (!requestedRoom) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (requestedRoom.allocations.length >= 3) {
      return NextResponse.json({ error: "Requested room is full" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: session.user.id },
    });
    if (student?.gender && requestedRoom.block.gender && requestedRoom.block.gender !== "mixed" && requestedRoom.block.gender !== student.gender) {
      return NextResponse.json({ error: "Room gender does not match" }, { status: 400 });
    }

    const req_ = await prisma.roomChangeRequest.create({
      data: {
        studentId: session.user.id,
        currentRoomId: allocation.roomId,
        requestedRoomId: parsed.requestedRoomId,
        reason: parsed.reason,
      },
    });

    return NextResponse.json({ success: true, id: req_.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
