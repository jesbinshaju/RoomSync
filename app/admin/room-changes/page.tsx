"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Request = {
  id: string;
  student: { fullName: string };
  currentRoom: { roomNumber: string; block: { blockName: string } };
  requestedRoom: { roomNumber: string; block: { blockName: string } };
  reason: string;
  status: string;
};

export default function RoomChangesPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/room-changes")
      .then((r) => r.json())
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  async function resolve(id: string, status: "approved" | "rejected", remarks?: string) {
    const res = await fetch(`/api/admin/room-changes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminRemarks: remarks }),
    });
    if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== id));
    else alert("Failed to update");
  }

  if (loading) return <p>Loading...</p>;

  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Room Change Requests</h1>

      {pending.length === 0 ? (
        <p className="text-muted-foreground">No pending requests.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((req) => (
            <Card key={req.id}>
              <CardHeader>
                <CardTitle>{req.student?.fullName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {req.currentRoom?.block?.blockName}-{req.currentRoom?.roomNumber} → {req.requestedRoom?.block?.blockName}-{req.requestedRoom?.roomNumber}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{req.reason}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => resolve(req.id, "approved")}>
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => resolve(req.id, "rejected")}>
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
