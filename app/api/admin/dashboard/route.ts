import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalStudents, totalRooms, allocatedCount, overdueCount, paidCount, pendingCount] = await Promise.all([
    prisma.student.count({ where: { isActive: true } }),
    prisma.room.count(),
    prisma.roomAllocation.count({ where: { isActive: true } }),
    prisma.feeInvoice.count({ where: { status: "overdue" } }),
    prisma.feeInvoice.count({ where: { status: "paid" } }),
    prisma.feeInvoice.count({ where: { status: { in: ["pending", "partial"] } } }),
  ]);

  const studentsWithProfile = await prisma.student.count({
    where: { isActive: true, characteristics: { isNot: null } },
  });
  const pendingAllocations = studentsWithProfile - allocatedCount;

  const totalInvoices = paidCount + pendingCount + overdueCount;
  const collectionRate = totalInvoices > 0 ? (paidCount / totalInvoices) * 100 : 0;
  const roomsFilledPct = totalRooms > 0 ? (allocatedCount / (totalRooms * 3)) * 100 : 0;

  return NextResponse.json({
    totalStudents,
    totalRooms,
    allocatedCount,
    pendingAllocations,
    overdueCount,
    collectionRate,
    roomsFilledPct,
  });
}
