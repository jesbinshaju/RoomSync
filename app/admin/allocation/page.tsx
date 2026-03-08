"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Student = { id: string; fullName: string; rollNumber: string; department: string; gender: string | null };
type Room = { id: string; roomNumber: string; floorNumber: number; block: { blockName: string }; allocations: unknown[] };

export default function AllocationPage() {
  const [unassigned, setUnassigned] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [manualStudent, setManualStudent] = useState("");
  const [manualRoom, setManualRoom] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/unassigned-students").then((r) => r.json()).then(setUnassigned).catch(() => {});
    fetch("/api/admin/rooms").then((r) => r.json()).then((data) => {
      const withSpace = (data || []).filter((room: Room) => room.allocations?.length < 3);
      setRooms(withSpace);
    }).catch(() => {});
  }, []);

  async function doManualAssign() {
    if (!manualStudent || !manualRoom) {
      alert("Select a student and a room.");
      return;
    }
    setManualLoading(true);
    try {
      const res = await fetch("/api/admin/manual-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: manualStudent, roomId: manualRoom }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Assign failed");
      setUnassigned((prev) => prev.filter((s) => s.id !== manualStudent));
      setManualStudent("");
      setManualRoom("");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Assign failed");
    } finally {
      setManualLoading(false);
    }
  }

  const [result, setResult] = useState<{
    roomsCreated: number;
    studentsAssigned: string[];
    studentsPending: string[];
    averageCompatibility: number;
    roomAssignments: Array<{
      roomId: string;
      roomNumber: string;
      blockName: string;
      students: Array<{ id: string; name: string; score: number }>;
      totalScore: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function runAllocation() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/run-allocation", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Allocation failed");
      setResult(data);
      setConfirm(false);
      fetch("/api/admin/unassigned-students").then((r) => r.json()).then(setUnassigned).catch(() => {});
      fetch("/api/admin/rooms").then((r) => r.json()).then((data) => {
        const withSpace = (data || []).filter((room: Room) => room.allocations?.length < 3);
        setRooms(withSpace);
      }).catch(() => {});
    } catch (e) {
      alert(e instanceof Error ? e.message : "Allocation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Room Allocation</h1>

      <Card>
        <CardHeader>
          <CardTitle>Run Matching Algorithm</CardTitle>
          <p className="text-sm text-muted-foreground">
            Assigns unallocated students to rooms of 3 based on compatibility scores.
          </p>
        </CardHeader>
        <CardContent>
          {!confirm ? (
            <Button onClick={() => setConfirm(true)}>Run Allocation</Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">Are you sure? This will assign students to available rooms.</p>
              <div className="flex gap-2">
                <Button onClick={runAllocation} disabled={loading}>
                  {loading ? "Running..." : "Confirm"}
                </Button>
                <Button variant="outline" onClick={() => setConfirm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Assign</CardTitle>
          <p className="text-sm text-muted-foreground">
            Assign a single student to a room with available space.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Student</label>
            <select
              className="w-full h-10 rounded-md border px-3 mt-1"
              value={manualStudent}
              onChange={(e) => setManualStudent(e.target.value)}
            >
              <option value="">Select student</option>
              {unassigned.map((s) => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.rollNumber})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Room</label>
            <select
              className="w-full h-10 rounded-md border px-3 mt-1"
              value={manualRoom}
              onChange={(e) => setManualRoom(e.target.value)}
            >
              <option value="">Select room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.block?.blockName} - {r.roomNumber}</option>
              ))}
            </select>
          </div>
          <Button onClick={doManualAssign} disabled={manualLoading || !manualStudent || !manualRoom}>
            {manualLoading ? "Assigning..." : "Assign"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <p className="text-sm text-muted-foreground">
              Rooms created: {result.roomsCreated} • Assigned: {result.studentsAssigned.length} • Pending: {result.studentsPending.length} • Avg compatibility: {result.averageCompatibility.toFixed(1)}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.roomAssignments.map((r) => (
                <div key={r.roomId} className="border rounded p-4">
                  <p className="font-medium">{r.blockName} - Room {r.roomNumber} (Score: {r.totalScore})</p>
                  <ul className="mt-2 text-sm text-muted-foreground">
                    {r.students.map((s) => (
                      <li key={s.id}>{s.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {result.studentsPending.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Pending (no full triplet): {result.studentsPending.length} students
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
