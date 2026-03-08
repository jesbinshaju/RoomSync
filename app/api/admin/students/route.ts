import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const blockId = searchParams.get("blockId");
  const department = searchParams.get("department");
  const feeStatus = searchParams.get("feeStatus");

  const where: Record<string, unknown> = { isActive: true };

  if (blockId) {
    where.roomAllocations = {
      some: {
        isActive: true,
        room: { blockId },
      },
    };
  }
  if (department) {
    where.department = department;
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      characteristics: true,
      roomAllocations: {
        where: { isActive: true },
        include: { room: { include: { block: true } } },
      },
      feeInvoices: {
        where: feeStatus ? { status: feeStatus } : undefined,
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(students);
}
