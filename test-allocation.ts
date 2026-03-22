import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  console.log("\n=== ALLOCATION TEST ===\n");
  
  // Check allocations exist
  const allocCount = await prisma.roomAllocation.count();
  console.log(`✓ Total allocations in DB: ${allocCount}`);
  
  // Get a test student with allocation
  const allocation = await prisma.roomAllocation.findFirst({
    where: { isActive: true },
    include: { 
      student: { select: { email: true, id: true } },
      room: { select: { id: true, roomNumber: true, blockId: true } }
    }
  });
  
  if (allocation) {
    console.log(`✓ Sample allocation found:`);
    console.log(`  Student: ${allocation.student.email}`);
    console.log(`  Student ID: ${allocation.student.id}`);
    console.log(`  Room: ${allocation.room.roomNumber}`);
    console.log(`  Is Active: ${allocation.isActive}`);
    
    // Test the exact query that the API uses
    console.log(`\n✓ Testing API query with student ID: ${allocation.student.id.substring(0, 8)}...`);
    
    const apiQuery = await prisma.roomAllocation.findFirst({
      where: { 
        studentId: allocation.student.id, 
        isActive: true 
      },
      include: {
        room: { include: { block: true } }
      }
    });
    
    if (apiQuery) {
      console.log(`✓ API query SUCCESS - Found allocation`);
      console.log(`  Block: ${apiQuery.room.block.blockName}, Room: ${apiQuery.room.roomNumber}`);
    } else {
      console.log(`✗ API query FAILED - No allocation found`);
    }
  } else {
    console.log("✗ No allocations found!");
  }
  
  // List all allocated students
  console.log(`\n✓ All allocated students (first 10):`);
  const allocs = await prisma.roomAllocation.findMany({
    where: { isActive: true },
    include: { student: { select: { email: true } } },
    take: 10
  });
  
  allocs.forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.student.email} - Auth test: ${a.student.email} / password123`);
  });
  
  await prisma.$disconnect();
  console.log("\n=== TEST COMPLETE ===\n");
}

test().catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
