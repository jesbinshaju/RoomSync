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
    include: {
      room: {
        include: { block: true },
      },
    },
  });

  if (!allocation) {
    return NextResponse.json({ allocation: null, message: "No room assigned yet" });
  }

  return NextResponse.json({
    allocation: {
      room: allocation.room,
      block: allocation.room.block,
      allocatedAt: allocation.allocatedAt,
    },
  });
}
