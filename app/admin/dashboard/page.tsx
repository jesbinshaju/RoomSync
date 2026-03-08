import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getData() {
  const headersList = await headers();
  const cookie = headersList.get("cookie") || "";
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/admin/dashboard`, {
    cache: "no-store",
    headers: { cookie },
  });
  if (!res.ok) return null;
  return res.json();
}

const StatCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  variant = "default" 
}: { 
  icon: string; 
  title: string; 
  value: string | number; 
  subtitle?: string;
  variant?: "default" | "warning" | "success" | "error";
}) => {
  const variantStyles = {
    default: "border-white/10",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    success: "border-green-500/30 bg-green-500/5",
    error: "border-red-500/30 bg-red-500/5",
  };

  return (
    <Card className={`glass border-2 ${variantStyles[variant]}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-4xl font-bold mt-2">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>
          <div className="text-4xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default async function AdminDashboardPage() {
  const data = await getData();

  if (!data) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Card className="glass">
          <CardContent className="pt-8 text-center">
            <p className="text-lg text-muted-foreground">Unable to load dashboard. Ensure you are signed in as admin.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const occupancyPercent = Math.round((data.allocatedCount / (data.totalRooms * 3)) * 100);
  const isHighOccupancy = occupancyPercent >= 80;
  const isPendingHigh = data.pendingAllocations > 10;
  const isOverdueHigh = data.overdueCount > 5;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">System overview and key metrics</p>
      </div>

      {/* Key Metrics - Top Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon="👥"
          title="Total Students"
          value={data.totalStudents}
          subtitle="Registered users"
        />
        <StatCard 
          icon="📊"
          title="Occupancy Rate"
          value={`${occupancyPercent}%`}
          subtitle={`${data.allocatedCount} / ${data.totalRooms * 3} beds`}
          variant={isHighOccupancy ? "success" : "default"}
        />
        <StatCard 
          icon="⏳"
          title="Pending Allocation"
          value={data.pendingAllocations}
          subtitle="Awaiting assignment"
          variant={isPendingHigh ? "warning" : "default"}
        />
        <StatCard 
          icon="⚠️"
          title="Overdue Invoices"
          value={data.overdueCount}
          subtitle="Payment pending"
          variant={isOverdueHigh ? "error" : "default"}
        />
      </div>

      {/* Main Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Fee Collection */}
        <Card className="glass-sm">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-2xl">💳 Fee Collection</CardTitle>
            <CardDescription>This semester's collection rate</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-end justify-between mb-3">
                  <span className="font-semibold text-lg">Collection Rate</span>
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {(data.collectionRate ?? 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${data.collectionRate ?? 0}%` }}
                  />
                </div>
              </div>

              {data.collectionRate >= 80 ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 font-semibold text-sm">✓ Excellent collection status</p>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 font-semibold text-sm">⚠️ Collection needs attention</p>
                </div>
              )}

              <Button asChild className="w-full">
                <Link href="/admin/fees">View Fee Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Room Occupancy */}
        <Card className="glass-sm">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-2xl">🏠 Room Occupancy</CardTitle>
            <CardDescription>Bed allocation status</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-end justify-between mb-3">
                  <span className="font-semibold text-lg">Occupancy</span>
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {data.allocatedCount}/{data.totalRooms * 3}
                  </span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="glass p-3 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Rooms</p>
                  <p className="text-2xl font-bold">{data.totalRooms}</p>
                </div>
                <div className="glass p-3 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Available</p>
                  <p className="text-2xl font-bold text-green-400">{data.availableRooms || 0}</p>
                </div>
                <div className="glass p-3 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Capacity</p>
                  <p className="text-2xl font-bold">{data.totalRooms * 3}</p>
                </div>
              </div>

              <Button asChild className="w-full">
                <Link href="/admin/rooms">Manage Rooms</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-sm">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-2xl">⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button asChild variant="outline" className="flex-col h-24">
              <Link href="/admin/allocation" className="flex-col gap-2">
                <span className="text-2xl">🎯</span>
                <span className="text-xs">Run Allocation</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-col h-24">
              <Link href="/admin/students" className="flex-col gap-2">
                <span className="text-2xl">👥</span>
                <span className="text-xs">View Students</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-col h-24">
              <Link href="/admin/fees" className="flex-col gap-2">
                <span className="text-2xl">💳</span>
                <span className="text-xs">Fee Management</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-col h-24">
              <Link href="/admin/room-changes" className="flex-col gap-2">
                <span className="text-2xl">🔄</span>
                <span className="text-xs">Room Changes</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-sm">
          <CardHeader>
            <CardTitle className="text-lg">📈 System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm">Students Registered</span>
              <span className="font-bold text-lg text-primary">{data.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm">Allocated Students</span>
              <span className="font-bold text-lg text-accent">{data.allocatedCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm">Pending Allocation</span>
              <span className="font-bold text-lg text-yellow-400">{data.pendingAllocations}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-sm">
          <CardHeader>
            <CardTitle className="text-lg">💰 Financial Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm">Collection Rate</span>
              <span className="font-bold text-lg text-primary">{(data.collectionRate ?? 0).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm">Overdue Invoices</span>
              <span className="font-bold text-lg text-red-400">{data.overdueCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm">Pending Payments</span>
              <span className="font-bold text-lg text-yellow-400">{data.pendingPayments || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-sm">
          <CardHeader>
            <CardTitle className="text-lg">🏢 Room Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm">Total Capacity</span>
              <span className="font-bold text-lg text-primary">{data.totalRooms * 3}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm">Occupied Beds</span>
              <span className="font-bold text-lg text-accent">{data.allocatedCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm">Available Beds</span>
              <span className="font-bold text-lg text-green-400">{(data.totalRooms * 3) - data.allocatedCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}