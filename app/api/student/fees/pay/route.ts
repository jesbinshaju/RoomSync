import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const paySchema = z.object({
  invoiceId: z.string().uuid(),
  amountPaid: z.number().positive(),
  paymentMethod: z.enum(["upi", "netbanking", "card", "cash", "dd", "scholarship"]),
  transactionRef: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { role?: string }).role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allocation = await prisma.roomAllocation.findFirst({
    where: { studentId: session.user.id, isActive: true },
  });
  if (!allocation) {
    return NextResponse.json({ error: "No active room allocation" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = paySchema.parse(body);

    const invoice = await prisma.feeInvoice.findFirst({
      where: { id: parsed.invoiceId, studentId: session.user.id },
      include: { payments: true },
    });

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (["paid", "waived"].includes(invoice.status)) {
      return NextResponse.json({ error: "Invoice already settled" }, { status: 400 });
    }

    const totalPaid = invoice.payments.reduce((s, p) => s + Number(p.amountPaid), 0);
    const totalDue = Number(invoice.baseAmount) + Number(invoice.messAmount) + Number(invoice.fineAmount) - Number(invoice.discountAmount);
    const remaining = totalDue - totalPaid;

    if (parsed.amountPaid > remaining) {
      return NextResponse.json({ error: "Amount exceeds remaining due" }, { status: 400 });
    }

    await prisma.feePayment.create({
      data: {
        invoiceId: parsed.invoiceId,
        studentId: session.user.id,
        amountPaid: parsed.amountPaid,
        paymentMethod: parsed.paymentMethod,
        transactionRef: parsed.transactionRef,
        notes: parsed.notes,
      },
    });

    const updatedInvoice = await prisma.feeInvoice.findUnique({
      where: { id: parsed.invoiceId },
      include: { payments: true },
    });

    const newTotalPaid = updatedInvoice!.payments.reduce((s, p) => s + Number(p.amountPaid), 0);
    const newStatus = newTotalPaid >= totalDue ? "paid" : "partial";

    await prisma.feeInvoice.update({
      where: { id: parsed.invoiceId },
      data: { status: newStatus },
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
