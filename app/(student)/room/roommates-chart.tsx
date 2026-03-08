"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const CATEGORIES = [
  { key: "academicScore", name: "Academic" },
  { key: "sleepScore", name: "Sleep" },
  { key: "hobbyScore", name: "Hobby" },
  { key: "lifestyleScore", name: "Lifestyle" },
  { key: "foodScore", name: "Food" },
  { key: "environmentScore", name: "Environment" },
];

export function RoommatesChart({
  compatibility,
  roommates,
}: {
  compatibility: Array<{
    studentId: string;
    totalScore: number;
    academicScore: number;
    sleepScore: number;
    hobbyScore: number;
    lifestyleScore: number;
    foodScore: number;
    environmentScore: number;
  }>;
  roommates: Array<{ id: string; fullName: string }>;
}) {
  const data = CATEGORIES.map((cat) => {
    const point: Record<string, string | number> = { category: cat.name };
    compatibility.forEach((c, i) => {
      const name = roommates.find((r) => r.id === c.studentId)?.fullName || `Roommate ${i + 1}`;
      point[name] = Number((c as Record<string, unknown>)[cat.key]) || 0;
    });
    return point;
  });

  const colors = ["#8b5cf6", "#ec4899"];

  return (
    <div className="h-80">
      <h3 className="text-lg font-semibold mb-4">Compatibility Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis angle={30} domain={[0, 25]} />
          {compatibility.map((c, i) => {
            const name = roommates.find((r) => r.id === c.studentId)?.fullName || `Roommate ${i + 1}`;
            return (
              <Radar
                key={c.studentId}
                name={name}
                dataKey={name}
                stroke={colors[i % colors.length]}
                fill={colors[i % colors.length]}
                fillOpacity={0.3}
              />
            );
          })}
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
