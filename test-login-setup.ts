import { prisma } from "./lib/db";

async function testViaAPI() {
  console.log("Checking if dev server is running...\n");
  
  try {
    // Test if server is running
    const response = await fetch("http://localhost:3000/api/auth/session");
    console.log("✓ Dev server is running (session endpoint returned:", response.status, ")\n");
    
    // Check database
    const student = await prisma.student.findUnique({
      where: { email: "male1@test.com" },
    });
    
    if (student) {
      console.log("✓ Student exists in database:");
      console.log(`  - Email: ${student.email}`);
      console.log(`  - IsActive: ${student.isActive}`);
      console.log(`  - FullName: ${student.fullName}`);
      console.log("\nYou can now test the login flow in the browser at:");
      console.log("  URL: http://localhost:3000/login");
      console.log("  Email: male1@test.com");
      console.log("  Password: password123");
    } else {
      console.log("✗ Student not found in database");
    }
  } catch (error: any) {
    console.log("Error:", error.message);
  }
  
  process.exit(0);
}

testViaAPI();
