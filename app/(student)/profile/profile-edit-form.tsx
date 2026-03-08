"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateCompatibility, HOBBY_OPTIONS } from "@/lib/matching";

type Student = {
  id: string;
  fullName: string;
  email: string;
  rollNumber: string;
  department: string;
  yearOfStudy: number | null;
  gender: string | null;
  characteristics: {
    academicMajor: string;
    studyHoursPerDay: number;
    studyTimePreference: string;
    academicGoal: string;
    sleepTime: string;
    wakeTime: string;
    napFrequency: string;
    hobbies: string[];
    cleanlinessLevel: number;
    noiseTolerance: number;
    socialLevel: number;
    guestFrequency: string;
    smoking: boolean;
    drinking: boolean;
    dietType: string;
    foodInRoom: boolean;
    acPreference: string;
    lightSensitivity: string;
  } | null;
};

export function ProfileEditForm({ student }: { student: Student }) {
  const [form, setForm] = useState(student.characteristics || {} as Student["characteristics"]);
  const [preview, setPreview] = useState<{ total: number } | null>(null);

  useEffect(() => {
    if (!form || !student.characteristics) return;
    const c = calculateCompatibility(
      {
        academicMajor: form.academicMajor,
        studyHoursPerDay: form.studyHoursPerDay,
        studyTimePreference: form.studyTimePreference,
        academicGoal: form.academicGoal,
        sleepTime: form.sleepTime,
        wakeTime: form.wakeTime,
        napFrequency: form.napFrequency,
        hobbies: form.hobbies,
        cleanlinessLevel: form.cleanlinessLevel,
        noiseTolerance: form.noiseTolerance,
        socialLevel: form.socialLevel,
        guestFrequency: form.guestFrequency,
        smoking: form.smoking,
        drinking: form.drinking,
        dietType: form.dietType,
        foodInRoom: form.foodInRoom,
        acPreference: form.acPreference,
        lightSensitivity: form.lightSensitivity,
      },
      student.characteristics
    );
    setPreview({ total: c.total });
  }, [form, student.characteristics]);

  const update = (k: keyof NonNullable<Student["characteristics"]>, v: unknown) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/student/characteristics", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) window.location.reload();
    else alert("Update failed");
  }

  if (!student.characteristics || !form) {
    return <p className="text-muted-foreground">No characteristics to edit. Complete registration first.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Characteristics</CardTitle>
        {preview && (
          <p className="text-sm text-muted-foreground">
            Live compatibility preview (vs your current profile): {preview.total}/100
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Academic Major</Label>
            <Input value={form.academicMajor} onChange={(e) => update("academicMajor", e.target.value)} />
          </div>
          <div>
            <Label>Study Hours</Label>
            <Input
              type="number"
              min={0}
              max={16}
              value={form.studyHoursPerDay}
              onChange={(e) => update("studyHoursPerDay", parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Hobbies (max 5)</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {HOBBY_OPTIONS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() =>
                    update(
                      "hobbies",
                      form.hobbies.includes(h)
                        ? form.hobbies.filter((x) => x !== h)
                        : form.hobbies.length < 5
                        ? [...form.hobbies, h]
                        : form.hobbies
                    )
                  }
                  className={`px-3 py-1 rounded text-sm ${
                    form.hobbies.includes(h) ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Cleanliness (1-5)</Label>
            <input
              type="range"
              min={1}
              max={5}
              value={form.cleanlinessLevel}
              onChange={(e) => update("cleanlinessLevel", parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}
