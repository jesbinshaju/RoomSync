import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "./profile-edit-form";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as { role?: string }).role !== "student") {
    redirect("/login");
  }

  const student = await prisma.student.findUnique({
    where: { id: session.user.id },
    include: { characteristics: true },
  });

  if (!student) redirect("/login");

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      <ProfileEditForm student={student} />
    </div>
  );
}
