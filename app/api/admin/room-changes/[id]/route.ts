import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getAcademicYear } from "@/lib/fees";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  adminRemarks: z.string().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = updateSchema.parse(body);

    const changeReq = await prisma.roomChangeRequest.findUnique({
      where: { id, status: "pending" },
    });
    if (!changeReq) return NextResponse.json({ error: "Request not found or already resolved" }, { status: 404 });

    if (parsed.status === "approved") {
      await prisma.$transaction([
        prisma.roomAllocation.updateMany({
          where: { studentId: changeReq.studentId, isActive: true },
          data: { isActive: false, vacatedAt: new Date() },
        }),
        prisma.roomAllocation.create({
          data: {
            studentId: changeReq.studentId,
            roomId: changeReq.requestedRoomId,
            allocatedBy: "admin",
            academicYear: getAcademicYear(),
          },
        }),
      ]);
    }

    await prisma.roomChangeRequest.update({
      where: { id },
      data: {
        status: parsed.status,
        adminRemarks: parsed.adminRemarks,
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
