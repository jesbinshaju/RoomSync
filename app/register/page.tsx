"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HOBBY_OPTIONS } from "@/lib/matching";

const STEPS = 7;
const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "Other"];
const STUDY_PREF = ["morning", "afternoon", "evening", "night"];
const SLEEP_TIME = ["before_10pm", "around_midnight", "after_1am"];
const WAKE_TIME = ["before_6am", "6am_to_8am", "after_8am"];
const NAP_FREQ = ["never", "sometimes", "daily"];
const GUEST_FREQ = ["never", "rarely", "often"];
const DIET = ["vegetarian", "non_vegetarian", "vegan", "no_preference"];
const AC_PREF = ["always_on", "sometimes", "prefer_off"];
const LIGHT = ["light_sleeper", "moderate", "heavy_sleeper"];
const ACADEMIC_GOAL = ["top_grades", "balanced", "pass_only"];

const STEP_TITLES = [
  "Basic Information",
  "Academic Details",
  "Sleep Schedule",
  "Hobbies & Interests",
  "Lifestyle Preferences",
  "Environment",
  "Review & Submit"
];

const STEP_ICONS = ["👤", "📚", "😴", "🎮", "⚡", "🌍", "✅"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    rollNumber: "",
    phoneNumber: "",
    department: "",
    yearOfStudy: 2,
    gender: "male" as "male" | "female" | "other",
    academicMajor: "",
    studyHoursPerDay: 6,
    studyTimePreference: "evening",
    academicGoal: "balanced",
    sleepTime: "around_midnight",
    wakeTime: "6am_to_8am",
    napFrequency: "sometimes",
    hobbies: [] as string[],
    cleanlinessLevel: 3,
    noiseTolerance: 3,
    socialLevel: 3,
    guestFrequency: "rarely",
    smoking: false,
    drinking: false,
    dietType: "no_preference",
    foodInRoom: true,
    acPreference: "sometimes",
    lightSensitivity: "moderate",
  });

  const update = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const toggleHobby = (h: string) => {
    setForm((f) => ({
      ...f,
      hobbies: f.hobbies.includes(h)
        ? f.hobbies.filter((x) => x !== h)
        : f.hobbies.length < 5
        ? [...f.hobbies, h]
        : f.hobbies,
    }));
  };

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        rollNumber: form.rollNumber,
        phoneNumber: form.phoneNumber || undefined,
        department: form.department,
        yearOfStudy: form.yearOfStudy,
        gender: form.gender,
        characteristics: {
          academicMajor: form.academicMajor || form.department,
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
      };
      console.log("Submitting registration:", JSON.stringify(payload, null, 2));
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Registration error response:", data);
        const errorMsg = Array.isArray(data.details)
          ? data.details.join(", ")
          : data.error || "Registration failed";
        throw new Error(errorMsg);
      }
      router.push("/login");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Registration failed";
      console.error("Submit error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <Link href="/login" className="flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors">
            ← Back to Login
          </Link>
          <div className="text-sm text-muted-foreground font-medium">
            {step} / {STEPS}
          </div>
        </div>

        {/* Progress Indicator - Visual Steps */}
        <div className="mb-10 flex justify-between items-center gap-2">
          {STEP_TITLES.map((title, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === step;
            const isCompleted = stepNum < step;
            return (
              <div
                key={idx}
                className={`flex-1 flex flex-col items-center transition-all duration-300 cursor-pointer`}
                onClick={() => stepNum < step && setStep(stepNum)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                      : isActive
                      ? "glass ring-2 ring-primary text-primary animate-pulse"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isCompleted ? "✓" : STEP_ICONS[idx]}
                </div>
                <span className={`text-xs mt-2 text-center leading-tight hidden md:block ${
                  isActive ? "font-bold text-primary" : isCompleted ? "text-accent" : "text-muted-foreground"
                }`}>
                  {title.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main Form Card */}
        <Card className="mb-6">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{STEP_ICONS[step - 1]}</span>
              <div>
                <CardTitle className="text-3xl">{STEP_TITLES[step - 1]}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {step === 1 && "Create your account and basic profile"}
                  {step === 2 && "Tell us about your academic interests"}
                  {step === 3 && "Help us understand your sleep patterns"}
                  {step === 4 && "Share your interests and hobbies"}
                  {step === 5 && "Let us know your lifestyle preferences"}
                  {step === 6 && "Environmental and comfort preferences"}
                  {step === 7 && "Review your information before submitting"}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            <div className="space-y-6">
              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Full Name</Label>
                      <Input placeholder="John Doe" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Gender</Label>
                      <select
                        className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-foreground transition-all duration-300 hover:bg-white/[0.08] focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={form.gender}
                        onChange={(e) => update("gender", e.target.value as "male" | "female" | "other")}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Roll Number</Label>
                      <Input placeholder="21CS001" value={form.rollNumber} onChange={(e) => update("rollNumber", e.target.value)} required />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Email</Label>
                      <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Password</Label>
                      <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Phone (Optional)</Label>
                      <Input placeholder="+91 XXXXX XXXXX" value={form.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Department</Label>
                      <select
                        className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-foreground transition-all duration-300 hover:bg-white/[0.08] focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={form.department}
                        onChange={(e) => update("department", e.target.value)}
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Year of Study</Label>
                      <select
                        className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-foreground transition-all duration-300 hover:bg-white/[0.08] focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={form.yearOfStudy}
                        onChange={(e) => update("yearOfStudy", parseInt(e.target.value) || 1)}
                      >
                        {[1, 2, 3, 4, 5].map((y) => (
                          <option key={y} value={y}>Year {y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Academic Major</Label>
                    <Input placeholder="e.g., Computer Science, Electronics" value={form.academicMajor} onChange={(e) => update("academicMajor", e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Study Hours / Day: {form.studyHoursPerDay}h</Label>
                      <input
                        type="range"
                        min={0}
                        max={16}
                        value={form.studyHoursPerDay}
                        onChange={(e) => update("studyHoursPerDay", parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <p className="text-xs text-muted-foreground mt-2">{form.studyHoursPerDay}h daily</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Study Preference</Label>
                      <select
                        className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-foreground transition-all duration-300 hover:bg-white/[0.08] focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={form.studyTimePreference}
                        onChange={(e) => update("studyTimePreference", e.target.value)}
                      >
                        {STUDY_PREF.map((p) => (
                          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Academic Goal</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {ACADEMIC_GOAL.map((g) => (
                        <button
                          key={g}
                          onClick={() => update("academicGoal", g)}
                          className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                            form.academicGoal === g
                              ? "border-primary bg-primary/20 text-primary"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          {g === "top_grades" && "🏆 Top Grades"}
                          {g === "balanced" && "⚖️ Balanced"}
                          {g === "pass_only" && "📖 Pass Only"}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Sleep Time</Label>
                      <select
                        className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-foreground transition-all duration-300 hover:bg-white/[0.08] focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={form.sleepTime}
                        onChange={(e) => update("sleepTime", e.target.value)}
                      >
                        {SLEEP_TIME.map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Wake Time</Label>
                      <select
                        className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-foreground transition-all duration-300 hover:bg-white/[0.08] focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={form.wakeTime}
                        onChange={(e) => update("wakeTime", e.target.value)}
                      >
                        {WAKE_TIME.map((w) => (
                          <option key={w} value={w}>{w.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Nap Frequency</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {NAP_FREQ.map((n) => (
                        <button
                          key={n}
                          onClick={() => update("napFrequency", n)}
                          className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                            form.napFrequency === n
                              ? "border-primary bg-primary/20 text-primary"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          {n === "never" && "❌ Never"}
                          {n === "sometimes" && "⏰ Sometimes"}
                          {n === "daily" && "😴 Daily"}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 4 && (
                <div>
                  <Label className="text-sm font-semibold mb-4 block">Select Your Hobbies (Max 5)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {HOBBY_OPTIONS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => toggleHobby(h)}
                        className={`px-4 py-3 rounded-lg border-2 transition-all font-medium text-sm ${
                          form.hobbies.includes(h)
                            ? "border-primary bg-primary/20 text-primary shadow-lg shadow-primary/20"
                            : "border-white/10 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 p-4 glass rounded-lg">
                    <p className="text-sm text-muted-foreground">Selected ({form.hobbies.length}/5):</p>
                    {form.hobbies.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.hobbies.map((h) => (
                          <span key={h} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                            {h}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm mt-2">None yet</p>
                    )}
                  </div>
                </div>
              )}

              {step === 5 && (
                <>
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Cleanliness: {form.cleanlinessLevel}/5</Label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={form.cleanlinessLevel}
                      onChange={(e) => update("cleanlinessLevel", parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Messy</span>
                      <span>Very Clean</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Noise Tolerance: {form.noiseTolerance}/5</Label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={form.noiseTolerance}
                      onChange={(e) => update("noiseTolerance", parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Very Sensitive</span>
                      <span>Very Tolerant</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Social Level: {form.socialLevel}/5</Label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={form.socialLevel}
                      onChange={(e) => update("socialLevel", parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Introverted</span>
                      <span>Extroverted</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Guest Frequency</Label>
                    <select
                      className="w-full h-12 rounded-lg border border-white/20 bg-white/5 px-4 text-foreground transition-all duration-300 hover:bg-white/[0.08] focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={form.guestFrequency}
                      onChange={(e) => update("guestFrequency", e.target.value)}
                    >
                      {GUEST_FREQ.map((g) => (
                        <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-4 glass rounded-lg cursor-pointer hover:bg-white/10 transition">
                      <input
                        type="checkbox"
                        checked={form.smoking}
                        onChange={(e) => update("smoking", e.target.checked)}
                        className="w-5 h-5 accent-primary"
                      />
                      <span className="font-medium">Smoking 🚬</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 glass rounded-lg cursor-pointer hover:bg-white/10 transition">
                      <input
                        type="checkbox"
                        checked={form.drinking}
                        onChange={(e) => update("drinking", e.target.checked)}
                        className="w-5 h-5 accent-primary"
                      />
                      <span className="font-medium">Drinking 🍺</span>
                    </label>
                  </div>
                </>
              )}

              {step === 6 && (
                <>
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Diet Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {DIET.map((d) => (
                        <button
                          key={d}
                          onClick={() => update("dietType", d)}
                          className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                            form.dietType === d
                              ? "border-primary bg-primary/20 text-primary"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          {d === "vegetarian" && "🥗 Vegetarian"}
                          {d === "non_vegetarian" && "🍗 Non-Veg"}
                          {d === "vegan" && "🌱 Vegan"}
                          {d === "no_preference" && "🍽️ No Preference"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-4 glass rounded-lg cursor-pointer hover:bg-white/10 transition">
                    <input
                      type="checkbox"
                      checked={form.foodInRoom}
                      onChange={(e) => update("foodInRoom", e.target.checked)}
                      className="w-5 h-5 accent-primary"
                    />
                    <span className="font-medium">Food in Room Allowed 🍕</span>
                  </label>

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">AC Preference</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {AC_PREF.map((a) => (
                        <button
                          key={a}
                          onClick={() => update("acPreference", a)}
                          className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                            form.acPreference === a
                              ? "border-primary bg-primary/20 text-primary"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          {a === "always_on" && "❄️ Always"}
                          {a === "sometimes" && "🌡️ Sometimes"}
                          {a === "prefer_off" && "💨 Prefer Off"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Light Sensitivity</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {LIGHT.map((l) => (
                        <button
                          key={l}
                          onClick={() => update("lightSensitivity", l)}
                          className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                            form.lightSensitivity === l
                              ? "border-primary bg-primary/20 text-primary"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          {l === "light_sleeper" && "☀️ Light"}
                          {l === "moderate" && "🌙 Moderate"}
                          {l === "heavy_sleeper" && "🌑 Heavy"}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 7 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-4 rounded-lg">
                      <p className="text-muted-foreground text-sm">Full Name</p>
                      <p className="font-bold text-lg mt-1">{form.fullName}</p>
                    </div>
                    <div className="glass p-4 rounded-lg">
                      <p className="text-muted-foreground text-sm">Email</p>
                      <p className="font-bold text-lg mt-1">{form.email}</p>
                    </div>
                    <div className="glass p-4 rounded-lg">
                      <p className="text-muted-foreground text-sm">Roll Number</p>
                      <p className="font-bold text-lg mt-1">{form.rollNumber}</p>
                    </div>
                    <div className="glass p-4 rounded-lg">
                      <p className="text-muted-foreground text-sm">Department</p>
                      <p className="font-bold text-lg mt-1">{form.department || "Not selected"}</p>
                    </div>
                  </div>

                  <div className="glass p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm mb-2">Sleep Schedule</p>
                    <p className="font-bold text-lg">{form.sleepTime} → {form.wakeTime}</p>
                  </div>

                  <div className="glass p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm mb-2">Hobbies</p>
                    <div className="flex flex-wrap gap-2">
                      {form.hobbies.length > 0 ? (
                        form.hobbies.map((h) => (
                          <span key={h} className="px-3 py-1 bg-primary/30 text-primary rounded-full text-sm font-medium">
                            {h}
                          </span>
                        ))
                      ) : (
                        <p className="text-muted-foreground">None</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-4">
                    <p className="text-sm text-foreground">
                      ✓ By submitting, you agree to our terms and help us find your perfect roommate match!
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 pt-8 mt-8 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="min-w-24"
              >
                ← Previous
              </Button>
              {step < STEPS ? (
                <Button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="min-w-24"
                >
                  Next →
                </Button>
              ) : (
                <Button
                  onClick={submit}
                  disabled={loading}
                  className="min-w-32"
                >
                  {loading ? "Submitting..." : "Complete Registration"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
