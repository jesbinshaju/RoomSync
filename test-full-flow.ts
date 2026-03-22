import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

async function testFullFlow() {
  console.log("\n=== FULL ALLOCATION FLOW TEST ===\n");
  
  // Step 1: Verify student and allocation exist
  const email = "male1@test.com";
  const studentId = "3031709e-6ea5-4abd-97e1-35dc425615f8";
  
  console.log("STEP 1: Check Student & Allocation in DB");
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { email: true, id: true }
  });
  console.log(`✓ Student: ${student?.email}`);
  
  const allocation = await prisma.roomAllocation.findFirst({
    where: { 
      studentId: studentId,
      isActive: true 
    },
    include: { 
      room: { include: { block: true } }
    }
  });
  
  if (allocation) {
    console.log(`✓ Allocation found: Block ${allocation.room.block.blockName}, Room ${allocation.room.roomNumber}`);
  } else {
    console.log("✗ NO ALLOCATION FOUND FOR THIS STUDENT");
  }
  
  // Step 2: Test the exact API query
  console.log("\nSTEP 2: Test API Query (like /api/student/room)");
  const apiAllocation = await prisma.roomAllocation.findFirst({
    where: { studentId: studentId, isActive: true },
    include: {
      room: {
        include: { block: true },
      },
    },
  });
  
  if (apiAllocation) {
    console.log(`✓ API query returned allocation`);
    console.log(`  Block: ${apiAllocation.room.block.blockName}`);
    console.log(`  Room: ${apiAllocation.room.roomNumber}`);
    console.log(`  Floor: ${apiAllocation.room.floorNumber}`);
    console.log(`  Capacity: ${apiAllocation.room.capacity}`);
  } else {
    console.log("✗ API query returned no allocation");
  }
  
  // Step 3: Verify authorization works
  console.log("\nSTEP 3: Test Authorization");
  const authStudent = await prisma.student.findUnique({
    where: { email: email, isActive: true },
  });
  
  if (!authStudent) {
    console.log("✗ Auth failed: student not found");
  } else {
    const passwordOk = await compare("password123", authStudent.passwordHash);
    console.log(`✓ Student found and password valid: ${passwordOk}`);
    console.log(`  Will return: id=${authStudent.id}`);
  }
  
  // Summary
  console.log("\n=== SUMMARY ===");
  if (allocation && apiAllocation && authStudent) {
    console.log("✅ ALL SYSTEMS WORKING - Allocation should display in UI");
    console.log("\nTest login with:");
    console.log(`  Email: ${email}`);
    console.log(`  Password: password123`);
    console.log(`  Role: student`);
  } else {
    console.log("❌ ISSUES FOUND - See above");
  }
  
  await prisma.$disconnect();
}

testFullFlow().catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
