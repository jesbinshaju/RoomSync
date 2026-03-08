import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentFeeSummary } from "@/lib/fees";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { role?: string }).role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await getStudentFeeSummary(session.user.id);
  return NextResponse.json(summary);
}
