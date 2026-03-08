import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getInvoices() {
  const headersList = await headers();
  const cookie = headersList.get("cookie") || "";
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/admin/fees`, { cache: "no-store", headers: { cookie } });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminFeesPage() {
  const invoices = await getInvoices();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Fees</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Invoice</th>
              <th className="text-left p-2">Student</th>
              <th className="text-left p-2">Amount</th>
              <th className="text-left p-2">Due Date</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv: {
              id: string;
              invoiceNumber: string;
              student: { fullName: string };
              baseAmount: number;
              messAmount: number;
              fineAmount: number;
              discountAmount: number;
              dueDate: string;
              status: string;
              payments: Array<{ amountPaid: number }>;
            }) => {
              const total = Number(inv.baseAmount) + Number(inv.messAmount) + Number(inv.fineAmount) - Number(inv.discountAmount);
              const paid = inv.payments?.reduce((s: number, p: { amountPaid: number }) => s + Number(p.amountPaid), 0) ?? 0;
              return (
                <tr key={inv.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">{inv.invoiceNumber}</td>
                  <td className="p-2">{inv.student?.fullName}</td>
                  <td className="p-2">₹{total.toLocaleString()} (Paid: ₹{paid.toLocaleString()})</td>
                  <td className="p-2">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        inv.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : inv.status === "overdue"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
