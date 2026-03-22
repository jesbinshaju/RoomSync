import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  const count = await prisma.roomAllocation.count();
  console.log("✓ Total allocations:", count);
  
  const first = await prisma.roomAllocation.findFirst({
    include: { student: true }
  });
  
  if (first) {
    console.log("✓ Sample allocation:", {
      studentEmail: first.student.email,
      roomId: first.roomId,
      isActive: first.isActive
    });
  }
  
  const byStudent = await prisma.roomAllocation.groupBy({
    by: ['studentId'],
    _count: true
  });
  
  console.log("✓ Allocations per student:");
  byStudent.slice(0, 5).forEach((g: any) => {
    console.log(`  - ${g._count} record(s)`);
  });
  
  await prisma.$disconnect();
}

check().catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
