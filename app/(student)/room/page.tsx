import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoommatesChart } from "./roommates-chart";
import { redirect } from "next/navigation";

async function getData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { role?: string }).role !== "student") redirect("/login");

  const allocation = await prisma.roomAllocation.findFirst({
    where: { studentId: session.user.id, isActive: true },
    include: { room: { include: { block: true } } },
  });

  if (!allocation) return { room: { allocation: null }, roommates: { roommates: [], compatibility: [] } };

  const roommateAllocs = await prisma.roomAllocation.findMany({
    where: { roomId: allocation.roomId, studentId: { not: session.user.id }, isActive: true },
    include: { student: { include: { characteristics: true } } },
  });

  const compatibility = await prisma.compatibilityScore.findMany({
    where: {
      OR: [
        { studentAId: session.user.id, studentBId: { in: roommateAllocs.map((r) => r.studentId) } },
        { studentBId: session.user.id, studentAId: { in: roommateAllocs.map((r) => r.studentId) } },
      ],
    },
  });

  const roommates = roommateAllocs.map((r) => ({
    id: r.student.id,
    fullName: r.student.fullName,
    department: r.student.department,
    yearOfStudy: r.student.yearOfStudy,
    characteristics: r.student.characteristics
      ? { academicMajor: r.student.characteristics.academicMajor, hobbies: r.student.characteristics.hobbies }
      : null,
  }));

  const compatMap = compatibility.map((c) => ({
    studentId: c.studentAId === session.user!.id ? c.studentBId : c.studentAId,
    totalScore: Number(c.totalScore),
    academicScore: Number(c.academicScore),
    sleepScore: Number(c.sleepScore),
    hobbyScore: Number(c.hobbyScore),
    lifestyleScore: Number(c.lifestyleScore),
    foodScore: Number(c.foodScore),
    environmentScore: Number(c.environmentScore),
  }));

  return {
    room: { allocation: { room: allocation.room, block: allocation.room.block } },
    roommates: { roommates, compatibility: compatMap },
  };
}

export default async function RoomPage() {
  const { room, roommates } = await getData();

  if (!room?.allocation) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">My Room</h1>
          <p className="text-muted-foreground">Your room allocation and roommate information</p>
        </div>
        <Card className="glass-sm">
          <CardContent className="py-16 text-center">
            <div className="space-y-4">
              <div className="text-6xl">📋</div>
              <p className="text-lg font-semibold">You have not been assigned a room yet</p>
              <p className="text-muted-foreground">Room allocation is done by the admin. Please check back later.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const r = room.allocation.room;
  const block = room.allocation.block;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">My Room</h1>
        <p className="text-muted-foreground">Your room details and roommate compatibility</p>
      </div>

      {/* Room Details Card */}
      <Card className="glass-sm overflow-hidden">
        <CardHeader className="border-b border-white/10 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{block?.blockName} - Room {r?.roomNumber}</CardTitle>
              <CardDescription className="mt-2">Floor {r?.floorNumber} • {r?.roomType} Type</CardDescription>
            </div>
            <div className="text-5xl">🏠</div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Room Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg mb-4">Room Features</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass p-4 rounded-lg text-center hover:scale-105 transition-transform">
                  <p className="text-2xl mb-2">👥</p>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-bold text-lg mt-1">{r?.capacity} beds</p>
                </div>
                <div className={`glass p-4 rounded-lg text-center hover:scale-105 transition-transform ${r?.hasAc ? "border-2 border-primary/50" : ""}`}>
                  <p className="text-2xl mb-2">{r?.hasAc ? "❄️" : "🌡️"}</p>
                  <p className="text-sm text-muted-foreground">AC</p>
                  <p className="font-bold text-lg mt-1">{r?.hasAc ? "Yes" : "No"}</p>
                </div>
                <div className={`glass p-4 rounded-lg text-center hover:scale-105 transition-transform ${r?.hasAttachedBathroom ? "border-2 border-primary/50" : ""}`}>
                  <p className="text-2xl mb-2">{r?.hasAttachedBathroom ? "🚿" : "🚽"}</p>
                  <p className="text-sm text-muted-foreground">Bath</p>
                  <p className="font-bold text-lg mt-1">{r?.hasAttachedBathroom ? "Attached" : "Shared"}</p>
                </div>
                <div className={`glass p-4 rounded-lg text-center hover:scale-105 transition-transform ${r?.hasBalcony ? "border-2 border-primary/50" : ""}`}>
                  <p className="text-2xl mb-2">{r?.hasBalcony ? "🌳" : "🪟"}</p>
                  <p className="text-sm text-muted-foreground">Balcony</p>
                  <p className="font-bold text-lg mt-1">{r?.hasBalcony ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg mb-4">Your Status</h3>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-lg p-6 text-center">
                <p className="text-5xl mb-3">✓</p>
                <p className="text-lg font-bold">Room Assigned</p>
                <p className="text-sm text-green-400 mt-2">Great! Your room has been allocated.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roommates Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">👥 Your Roommates</h2>
        
        {roommates?.roommates?.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {roommates.roommates.map((rm) => {
              const compat = roommates.compatibility.find(c => c.studentId === rm.id);
              const compatScore = compat?.totalScore || 0;
              const compatPercent = (compatScore / 100) * 100;
              
              return (
                <Card key={rm.id} className="glass-sm overflow-hidden hover:translate-y-[-4px] transition-transform">
                  <CardHeader className="border-b border-white/10 bg-gradient-to-r from-primary/5 to-accent/5">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{rm.fullName}</CardTitle>
                        <CardDescription className="mt-1">
                          {rm.department} • Year {rm.yearOfStudy ?? "—"}
                        </CardDescription>
                      </div>
                      <div className="text-3xl">👤</div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {/* Compatibility Score */}
                    {compat && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-muted-foreground">Compatibility</span>
                          <span className="text-lg font-bold text-primary">{compatScore.toFixed(0)}/100</span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                            style={{ width: `${compatPercent}%` }}
                          />
                        </div>
                        <div className={`text-xs font-medium ${
                          compatScore >= 70 ? "text-green-400" : 
                          compatScore >= 50 ? "text-yellow-400" : 
                          "text-red-400"
                        }`}>
                          {compatScore >= 70 ? "🟢 Highly Compatible" : 
                           compatScore >= 50 ? "🟡 Moderately Compatible" : 
                           "🔴 Low Compatibility"}
                        </div>
                      </div>
                    )}

                    {/* Academics */}
                    {rm.characteristics && (
                      <>
                        <div className="pt-2 border-t border-white/10">
                          <p className="text-sm text-muted-foreground mb-2">Academic Major</p>
                          <p className="font-medium">{rm.characteristics.academicMajor}</p>
                        </div>

                        {/* Hobbies */}
                        {rm.characteristics.hobbies && rm.characteristics.hobbies.length > 0 && (
                          <div className="pt-2 border-t border-white/10">
                            <p className="text-sm text-muted-foreground mb-2">Shared Interests</p>
                            <div className="flex flex-wrap gap-2">
                              {rm.characteristics.hobbies.map((h) => (
                                <span key={h} className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium">
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="glass-sm">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">You are the only one in this room.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Compatibility Chart */}
      {roommates?.compatibility?.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">📊 Compatibility Breakdown</h2>
          <Card className="glass-sm">
            <CardContent className="pt-6">
              <RoommatesChart compatibility={roommates.compatibility} roommates={roommates.roommates} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button asChild className="flex-1">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/room-change">🔄 Request Room Change</Link>
        </Button>
      </div>
    </div>
  );
}
