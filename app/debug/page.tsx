import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getData() {
  const allocations = await prisma.roomAllocation.findMany({
    include: {
      student: { select: { email: true, fullName: true } },
      room: { select: { roomNumber: true, block: { select: { blockName: true } } } }
    },
    take: 50
  });

  return allocations;
}

export default async function DebugPage() {
  const allocations = await getData();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Allocated Students (DEBUG)</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Total: {allocations.length} allocations found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allocations.map((alloc) => (
              <div key={alloc.id} className="border rounded p-3 text-sm">
                <p className="font-mono">{alloc.student.email}</p>
                <p className="text-muted-foreground text-xs">Block {alloc.room.block?.blockName} - Room {alloc.room.roomNumber}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Password: <code className="bg-muted p-1 rounded">password123</code></p>
          <p className="text-xs text-muted-foreground mt-2">All accounts above should show their room allocation when logged in.</p>
        </CardContent>
      </Card>
    </div>
  );
}
