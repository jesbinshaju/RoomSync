async function testAdminAllocation() {
  console.log("Testing Admin Allocation Endpoint...\n");

  try {
    // Get admin session first
    console.log("1. Testing admin session endpoint...");
    const sessionRes = await fetch("http://localhost:3000/api/auth/session");
    console.log(`   Session endpoint status: ${sessionRes.status}\n`);

    // Try creating a new year allocation
    console.log("2. Testing admin allocation endpoint...");
    const allocRes = await fetch("http://localhost:3000/api/admin/run-allocation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        academicYear: "2025-26",
      }),
    });

    console.log(`   Status: ${allocRes.status}`);
    
    if (allocRes.status === 200) {
      const data = await allocRes.json() as any;
      console.log(`   ✓ Allocation successful!`);
      console.log(`     - Rooms created: ${data.roomsCreated || 0}`);
      console.log(`     - Students assigned: ${data.studentsAssigned || 0}`);
      console.log(`     - Avg compatibility: ${data.avgCompatibility || 'N/A'}`);
    } else if (allocRes.status === 401) {
      const text = await allocRes.text();
      console.log(`   ✗ Unauthorized (status 401)`);
      console.log(`     This is expected - you need to be logged in as admin`);
      console.log(`     Response: ${text.slice(0, 100)}`);
    } else {
      const text = await allocRes.text();
      console.log(`   ✗ Error ${allocRes.status}`);
      console.log(`     Response: ${text.slice(0, 200)}`);
    }

  } catch (error: any) {
    console.error("Error:", error.message);
  }

  process.exit(0);
}

testAdminAllocation();
