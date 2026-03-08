import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { runAllocation } from "@/lib/allocation";
import { getAcademicYear } from "@/lib/fees";

export async function POST() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const academicYear = getAcademicYear();
    const result = await runAllocation(academicYear);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Allocation failed", details: String(e) },
      { status: 500 }
    );
  }
}
