import { runAllocation } from "@/lib/allocation";

async function testAllocation() {
  console.log("\n=== TESTING ALLOCATION ALGORITHM ===\n");
  
  try {
    const academicYear = `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`;
    console.log(`Academic Year: ${academicYear}\n`);
    
    const result = await runAllocation(academicYear);
    
    console.log(`✓ Allocation completed!`);
    console.log(`\n  Rooms created: ${result.roomsCreated}`);
    console.log(`  Students assigned: ${result.studentsAssigned.length}`);
    console.log(`  Students pending: ${result.studentsPending.length}`);
    console.log(`  Avg compatibility: ${result.averageCompatibility.toFixed(2)}/100`);
    
    if (result.roomAssignments.length > 0) {
      console.log(`\n✓ Sample room assignment (first one):`);
      const room = result.roomAssignments[0];
      console.log(`  Block ${room.blockName}, Room ${room.roomNumber}`);
      console.log(`  Total compatibility score: ${room.totalScore.toFixed(2)}`);
      room.students.forEach((s, i) => {
        console.log(`    ${i + 1}. ${s.name} (score: ${s.score.toFixed(2)})`);
      });
    } else {
      console.log("\n❌ NO ROOMS CREATED - Algorithm may have no available rooms");
    }
    
  } catch (e) {
    console.error("❌ ERROR:", e);
  }
}

testAllocation();
