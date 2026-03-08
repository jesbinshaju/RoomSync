import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getStudents() {
  const headersList = await headers();
  const cookie = headersList.get("cookie") || "";
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/admin/students`, { cache: "no-store", headers: { cookie } });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminStudentsPage() {
  const students = await getStudents();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Students</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Roll</th>
              <th className="text-left p-2">Department</th>
              <th className="text-left p-2">Room</th>
              <th className="text-left p-2">Fee Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s: {
              id: string;
              fullName: string;
              rollNumber: string;
              department: string;
              roomAllocations: Array<{ room: { roomNumber: string; block: { blockName: string } } }>;
              feeInvoices: Array<{ status: string }>;
            }) => (
              <tr key={s.id} className="border-b hover:bg-muted/50">
                <td className="p-2">{s.fullName}</td>
                <td className="p-2">{s.rollNumber}</td>
                <td className="p-2">{s.department}</td>
                <td className="p-2">
                  {s.roomAllocations?.[0]
                    ? `${s.roomAllocations[0].room.block.blockName}-${s.roomAllocations[0].room.roomNumber}`
                    : "—"}
                </td>
                <td className="p-2">
                  {s.feeInvoices?.some((f: { status: string }) => f.status === "overdue") ? (
                    <span className="text-red-600">Overdue</span>
                  ) : s.feeInvoices?.some((f: { status: string }) => f.status === "pending") ? (
                    <span className="text-yellow-600">Pending</span>
                  ) : (
                    <span className="text-green-600">Paid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
