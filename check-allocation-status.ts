import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  console.log("\n=== ALLOCATION STATUS CHECK ===\n");
  
  // Total students
  const totalStudents = await prisma.student.count();
  console.log(`Total Students: ${totalStudents}`);
  
  // Students with characteristics
  const withChars = await prisma.student.count({
    where: { characteristics: { isNot: null } }
  });
  console.log(`  - With characteristics: ${withChars}`);
  
  // Already allocated
  const allocated = await prisma.roomAllocation.count({
    where: { isActive: true }
  });
  console.log(`  - Already allocated: ${allocated}`);
  console.log(`  - NOT allocated: ${withChars - allocated}`);
  
  // Available rooms
  const availableRooms = await prisma.room.count({
    where: { status: { in: ["available", "partially_filled"] } }
  });
  console.log(`\nAvailable Rooms: ${availableRooms}`);
  
  const totalRooms = await prisma.room.count();
  console.log(`  - Total rooms: ${totalRooms}`);
  
  // Get unallocated students
  const unallocated = await prisma.student.findMany({
    where: {
      isActive: true,
      characteristics: { isNot: null },
      roomAllocations: {
        none: { isActive: true },
      },
    },
    select: { id: true, email: true }
  });
  
  console.log(`\nUnallocated students: ${unallocated.length}`);
  console.log("📌 THIS is the issue - from seeding, we pre-allocated students!");
  console.log("   So when you click 'Allocate', there's nobody new to allocate.\n");
  
  if (unallocated.length > 0) {
    console.log("Unallocated students:");
    unallocated.forEach(s => console.log(`  - ${s.email}`));
  }
  
  await prisma.$disconnect();
}

check().catch(console.error);
