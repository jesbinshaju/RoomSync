import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const invoices = await prisma.feeInvoice.findMany({
    where: status ? { status } : undefined,
    include: {
      student: true,
      room: true,
      feePlan: true,
      payments: true,
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(invoices);
}
