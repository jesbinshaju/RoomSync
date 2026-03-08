import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const students = await prisma.student.findMany({
    where: {
      isActive: true,
      characteristics: { isNot: null },
      roomAllocations: { none: { isActive: true } },
    },
    select: { id: true, fullName: true, rollNumber: true, department: true, gender: true },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json(students);
}
