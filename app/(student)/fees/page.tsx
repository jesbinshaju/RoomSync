import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentFeeSummary } from "@/lib/fees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeePayButton } from "./fee-pay-button";
import { redirect } from "next/navigation";

async function getData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { role?: string }).role !== "student") redirect("/login");
  return getStudentFeeSummary(session.user.id);
}

export default async function FeesPage() {
  const data = await getData();
  const invoices = data?.invoices || [];
  const totalDue = data?.totalDue ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Fees</h1>

      <Card>
        <CardHeader>
          <CardTitle>Total Pending</CardTitle>
          <p className="text-2xl font-bold text-primary">₹{totalDue.toLocaleString()}</p>
        </CardHeader>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Invoices</h2>
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <p className="text-muted-foreground">No invoices yet.</p>
          ) : (
            invoices.map((inv) => {
              const total = Number(inv.baseAmount) + Number(inv.messAmount) + Number(inv.fineAmount) - Number(inv.discountAmount);
              const paid = inv.payments?.reduce((s: number, p) => s + Number(p.amountPaid), 0) ?? 0;
              const remaining = total - paid;
              return (
                <Card key={inv.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{inv.invoiceNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {inv.academicYear} • Semester {inv.semester || "—"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        inv.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : inv.status === "overdue"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p>Total: ₹{total.toLocaleString()} • Paid: ₹{paid.toLocaleString()} • Due: ₹{remaining.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Due date: {new Date(inv.dueDate).toLocaleDateString()}</p>
                    {remaining > 0 && inv.status !== "waived" && (
                      <FeePayButton invoiceId={inv.id} amount={remaining} />
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
