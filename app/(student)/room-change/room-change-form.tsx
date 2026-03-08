"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RoomChangeForm({
  currentRoom,
  rooms,
}: {
  currentRoom: string;
  rooms: Array<{ id: string; label: string }>;
}) {
  const [requestedRoomId, setRequestedRoomId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!requestedRoomId || reason.length < 10) {
      alert("Please select a room and provide a reason (at least 10 characters).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/student/room-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedRoomId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setDone(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Your room change request has been submitted. The admin will review it shortly.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Request</CardTitle>
        <p className="text-sm text-muted-foreground">Current room: {currentRoom}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Requested Room</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
              value={requestedRoomId}
              onChange={(e) => setRequestedRoomId(e.target.value)}
              required
            >
              <option value="">Select a room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Reason (min 10 characters)</Label>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 mt-1 text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={10}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
