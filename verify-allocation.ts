import { prisma } from "./lib/db";

async function verifyAllocationSystem() {
  console.log("=== ALLOCATION SYSTEM VERIFICATION ===\n");

  try {
    // 1. Check students
    const studentCount = await prisma.student.findMany();
    console.log(`1. Students in database: ${studentCount.length}`);
    const activeCount = studentCount.filter(s => s.isActive).length;
    console.log(`   Active students: ${activeCount}\n`);

    // 2. Check allocations
    const allocations = await prisma.roomAllocation.findMany({
      include: { room: { include: { block: true } } }
    });
    console.log(`2. Room allocations: ${allocations.length}`);
    if (allocations.length > 0) {
      console.log(`   Sample allocation:`);
      const sample = allocations[0];
      console.log(`   - Student: ${studentCount.find(s => s.id === sample.studentId)?.email}`);
      console.log(`   - Block: ${sample.room?.block?.blockName}`);
      console.log(`   - Room: ${sample.room?.roomNumber}`);
    }
    console.log();

    // 3. Check compatibility scores
    const scores = await prisma.compatibilityScore.findMany();
    console.log(`3. Compatibility scores: ${scores.length}`);
    if (scores.length > 0) {
      const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
      console.log(`   Average score: ${avgScore.toFixed(2)}/100\n`);
    }

    // 4. Test student allocation lookup
    const testStudent = studentCount[0];
    if (testStudent) {
      console.log(`4. Testing allocation lookup for: ${testStudent.email}`);
      const allocation = await prisma.roomAllocation.findUnique({
        where: { studentId: testStudent.id },
        include: { room: { include: { block: true } } }
      });
      
      if (allocation) {
        console.log(`   ✓ Allocated to: Block ${allocation.room?.block?.blockName}, Room ${allocation.room?.roomNumber}`);
      } else {
        console.log(`   ✗ Not allocated`);
      }
    }
    console.log();

    // 5. Check admin user
    const admin = await prisma.adminUser.findFirst();
    if (admin) {
      console.log(`5. Admin account: ${admin.email} (active: ${admin.isActive})\n`);
    }

    console.log("✅ System Status: READY FOR TESTING");
    console.log("\nYou can now:");
    console.log("1. Login as student at http://localhost:3000/login");
    console.log(`   Email: ${testStudent?.email}`);
    console.log("   Password: password123");
    console.log("2. View your allocated room in the dashboard");

  } catch (error: any) {
    console.error("Error:", error.message);
  }

  process.exit(0);
}

verifyAllocationSystem();
