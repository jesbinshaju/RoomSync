import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { role?: string }).role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { id: session.user.id },
    include: { characteristics: true },
  });

  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { passwordHash, ...rest } = student;
  return NextResponse.json(rest);
}
