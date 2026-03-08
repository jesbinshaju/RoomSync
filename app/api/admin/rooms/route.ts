import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rooms = await prisma.room.findMany({
    include: {
      block: true,
      allocations: {
        where: { isActive: true },
        include: { student: true },
      },
    },
    orderBy: [{ blockId: "asc" }, { floorNumber: "asc" }, { roomNumber: "asc" }],
  });

  return NextResponse.json(rooms);
}
