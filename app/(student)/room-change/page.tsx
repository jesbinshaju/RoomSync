import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPendingFees } from "@/lib/fees";
import { redirect } from "next/navigation";
import { RoomChangeForm } from "./room-change-form";

export default async function RoomChangePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { role?: string }).role !== "student") {
    redirect("/login");
  }

  const allocation = await prisma.roomAllocation.findFirst({
    where: { studentId: session.user.id, isActive: true },
    include: { room: { include: { block: true } } },
  });

  const hasPending = await hasPendingFees(session.user.id);

  const availableRooms = await prisma.room.findMany({
    where: {
      status: { in: ["available", "partially_filled"] },
      block: { isActive: true },
      id: allocation ? { not: allocation.roomId } : undefined,
    },
    include: {
      block: true,
      allocations: { where: { isActive: true } },
    },
  });

  const roomsWithSpace = availableRooms.filter((r) => r.allocations.length < 3);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Request Room Change</h1>

      {!allocation ? (
        <p className="text-muted-foreground">You don&apos;t have a room assigned yet.</p>
      ) : hasPending ? (
        <p className="text-destructive">
          You cannot request a room change while you have pending or overdue fees. Please clear your dues first.
        </p>
      ) : (
        <RoomChangeForm
          currentRoom={`${allocation.room.block.blockName} - ${allocation.room.roomNumber}`}
          rooms={roomsWithSpace.map((r) => ({
            id: r.id,
            label: `${r.block.blockName} - ${r.roomNumber} (Floor ${r.floorNumber}, ${r.roomType})`,
          }))}
        />
      )}
    </div>
  );
}
