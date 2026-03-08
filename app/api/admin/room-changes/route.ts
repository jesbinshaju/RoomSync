import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.roomChangeRequest.findMany({
    where: { status: "pending" },
    include: {
      student: true,
      currentRoom: { include: { block: true } },
      requestedRoom: { include: { block: true } },
    },
    orderBy: { requestedAt: "desc" },
  });

  return NextResponse.json(requests);
}
