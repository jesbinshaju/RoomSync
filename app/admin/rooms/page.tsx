import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getRooms() {
  const headersList = await headers();
  const cookie = headersList.get("cookie") || "";
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/admin/rooms`, { cache: "no-store", headers: { cookie } });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminRoomsPage() {
  const rooms = await getRooms();

  const statusColor = (s: string) => {
    if (s === "available") return "bg-green-100 text-green-800";
    if (s === "partially_filled") return "bg-yellow-100 text-yellow-800";
    if (s === "full") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Rooms</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((room: {
          id: string;
          roomNumber: string;
          floorNumber: number;
          block: { blockName: string };
          status: string;
          roomType: string;
          allocations: Array<{ student: { fullName: string } }>;
        }) => (
          <Card key={room.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {room.block?.blockName} - {room.roomNumber}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Floor {room.floorNumber} • {room.roomType}
              </p>
            </CardHeader>
            <CardContent>
              <span className={`px-2 py-1 rounded text-xs ${statusColor(room.status)}`}>
                {room.status.replace("_", " ")}
              </span>
              {room.allocations?.length > 0 && (
                <ul className="mt-2 text-sm text-muted-foreground">
                  {room.allocations.map((a: { student: { fullName: string } }) => (
                    <li key={a.student.fullName}>{a.student.fullName}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
