import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudentFeeSummary } from "@/lib/fees";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { Decimal } from "@prisma/client/runtime/library";

// Define a more specific type for the return of getStudentFeeSummary
// Adjust this type based on the actual structure returned by getStudentFeeSummary if different
interface FeeSummary {
  invoices: Array<any>; // You might want to type this more specifically based on your invoice structure
  totalDue: number | Decimal;
  nextDue: {
    id: string;
    amount: number | Decimal;
    date: Date;
    // Add any other properties of nextDue here
  } | null;
  // If 'pendingInvoices' is indeed a property you expect, ensure getStudentFeeSummary returns it
  // For now, I'm assuming it should be derived from 'invoices' or added to the return type of getStudentFeeSummary
}

async function getData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { role?: string }).role !== "student") redirect("/login");

  const student = await prisma.student.findUnique({
    where: { id: session.user.id },
  });

  const allocation = await prisma.roomAllocation.findFirst({
    where: { studentId: session.user.id, isActive: true },
    include: { room: { include: { block: true } } },
  });

  const roommates = await prisma.roomAllocation.findMany({
    where: { roomId: allocation?.roomId, studentId: { not: session.user.id }, isActive: true },
    include: { student: true },
  });

  const fees = await getStudentFeeSummary(session.user.id) as FeeSummary; // Cast to our defined type

  return {
    student,
    allocation,
    roommates,
    fees
  };
}

export default async function DashboardPage() {
  const { student, allocation, roommates, fees } = await getData();

  const hasRoom = !!allocation;
  const nextDue = fees?.nextDue;
  
  // Calculate pendingInvoicesCount from fees.invoices or ensure getStudentFeeSummary returns it
  const pendingInvoicesCount = fees?.invoices?.filter((invoice: any) => !invoice.isPaid).length || 0;


  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome back, {student?.fullName?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">Here's your housing dashboard at a glance.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Room Assigned</p>
                <p className="text-3xl font-bold mt-2">{hasRoom ? "✓" : "⏳"}</p>
              </div>
              <div className="text-4xl">{hasRoom ? "🏠" : "📋"}</div>
            </div>
            {hasRoom && (
              <p className="text-sm text-primary mt-2 font-semibold">
                {allocation?.room?.block?.blockName} - {allocation?.room?.roomNumber}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Roommates</p>
                <p className="text-3xl font-bold mt-2">{roommates?.length || 0}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            {roommates?.length > 0 && (
              <p className="text-xs text-primary mt-2 font-semibold">
                Click to view profiles
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Pending Fees</p>
                {/* Use the calculated pendingInvoicesCount */}
                <p className="text-3xl font-bold mt-2">{pendingInvoicesCount}</p>
              </div>
              <div className="text-4xl">{nextDue ? "⚠️" : "✓"}</div>
            </div>
            {fees?.totalDue && (
              <p className="text-sm text-red-400 mt-2 font-semibold">
                ₹{new Decimal(fees.totalDue).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Profile</p>
                <p className="text-3xl font-bold mt-2">📊</p>
              </div>
              <div className="text-4xl">👤</div>
            </div>
            <p className="text-xs text-accent mt-2 font-semibold">
              View & Update
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Room Details */}
        <Card className="md:col-span-2 glass-sm">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">🏠 Your Room</CardTitle>
                <CardDescription>Current allocation and details</CardDescription>
              </div>
              {hasRoom && (
                <div className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-semibold">
                  ✓ Assigned
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {hasRoom && allocation ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm mb-2">Block</p>
                    <p className="font-bold text-lg">{allocation.room?.block?.blockName}</p>
                  </div>
                  <div className="glass p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm mb-2">Room No.</p>
                    <p className="font-bold text-lg">{allocation.room?.roomNumber}</p>
                  </div>
                  <div className="glass p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm mb-2">Floor</p>
                    <p className="font-bold text-lg">{allocation.room?.floorNumber}</p>
                  </div>
                  <div className="glass p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm mb-2">Capacity</p>
                    <p className="font-bold text-lg">{allocation.room?.capacity} bed{(allocation.room?.capacity ?? 0) > 1 ? "s" : ""}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {allocation.room?.hasAc && (
                    <div className="flex items-center gap-3 glass p-4 rounded-lg">
                      <span className="text-2xl">❄️</span>
                      <span className="font-semibold">AC Enabled</span>
                    </div>
                  )}
                  {allocation.room?.hasBalcony && (
                    <div className="flex items-center gap-3 glass p-4 rounded-lg">
                      <span className="text-2xl">🌳</span>
                      <span className="font-semibold">Balcony</span>
                    </div>
                  )}
                  {allocation.room?.hasAttachedBathroom && (
                    <div className="flex items-center gap-3 glass p-4 rounded-lg">
                      <span className="text-2xl">🚿</span>
                      <span className="font-semibold">Attached Bath</span>
                    </div>
                  )}
                </div>

                <Button asChild className="w-full">
                  <Link href="/room">View Full Room Details & Roommates</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-lg text-muted-foreground font-medium">📋 No room assigned yet</p>
                <p className="text-sm text-muted-foreground">Your room allocation is pending. Keep checking back!</p>
                <Button asChild variant="outline">
                  <Link href="/room">Check Status</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fees Overview */}
        <Card className="glass-sm">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">💳 Fees</CardTitle>
                <CardDescription>Payment status</CardDescription>
              </div>
              {!nextDue && (
                <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold">
                  All Paid
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {nextDue ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Next Payment Due</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {/* Ensure amount is converted to string for display */}
                    ₹{new Decimal(nextDue.amount).toLocaleString()}
                  </p>
                  <p className="text-sm text-accent font-semibold">
                    Due: {new Date(nextDue.date).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-sm text-red-400 font-medium">⚠️ Payment pending</p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/fees">Pay Now</Link>
                </Button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-5xl">✓</div>
                <p className="text-lg font-semibold">All fees paid!</p>
                <p className="text-sm text-muted-foreground">Great job staying on top of payments.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-sm">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-2xl">⚡ Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <Button asChild variant="outline" className="w-full justify-start h-12 text-base">
              <Link href="/room" className="gap-3">
                <span>🏠</span> View My Room
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-12 text-base">
              <Link href="/fees" className="gap-3">
                <span>💳</span> Pay Fees
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-12 text-base">
              <Link href="/profile" className="gap-3">
                <span>👤</span> Edit Profile
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-12 text-base">
              <Link href="/room-change" className="gap-3">
                <span>🔄</span> Request Room Change
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}