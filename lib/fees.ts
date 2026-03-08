import { prisma } from "./db";

export function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const nextYear = (year + 1).toString().slice(-2);
  return `${year}-${nextYear}`;
}

export async function getStudentFeeSummary(studentId: string) {
  const invoices = await prisma.feeInvoice.findMany({
    where: { studentId },
    include: { payments: true, feePlan: true },
    orderBy: { createdAt: "desc" },
  });

  const totalDue = invoices
    .filter((i) => ["pending", "partial", "overdue"].includes(i.status))
    .reduce((s, i) => {
      const base = Number(i.baseAmount) + Number(i.messAmount) + Number(i.fineAmount) - Number(i.discountAmount);
      const paid = i.payments.reduce((p, pay) => p + Number(pay.amountPaid), 0);
      return s + (base - paid);
    }, 0);

  const nextDue = invoices
    .filter((i) => ["pending", "partial", "overdue"].includes(i.status))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  return {
    invoices,
    totalDue,
    nextDue: nextDue
      ? {
          date: nextDue.dueDate,
          amount: Number(nextDue.baseAmount) + Number(nextDue.messAmount) + Number(nextDue.fineAmount) - Number(nextDue.discountAmount) -
            nextDue.payments.reduce((p, pay) => p + Number(pay.amountPaid), 0),
        }
      : null,
  };
}

export async function hasPendingFees(studentId: string): Promise<boolean> {
  const count = await prisma.feeInvoice.count({
    where: {
      studentId,
      status: { in: ["pending", "overdue"] },
    },
  });
  return count > 0;
}
