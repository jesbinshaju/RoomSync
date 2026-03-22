import { prisma } from "./lib/db";
import { compare } from "bcryptjs";

async function test() {
  console.log("Testing student lookup and password verification...\n");

  // Test 1: Find student
  console.log("1. Looking up student: male1@test.com");
  const student = await prisma.student.findUnique({
    where: { email: "male1@test.com", isActive: true },
  });
  
  if (!student) {
    console.log("   ✗ Student NOT found");
    console.log("   Let's check what's in the DB...");
    const allStudents = await prisma.student.findMany({ take: 5 });
    console.log("   Sample students:", allStudents.map(s => ({ email: s.email, isActive: s.isActive })));
  } else {
    console.log("   ✓ Student found!");
    console.log(`   ID: ${student.id}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   IsActive: ${student.isActive}`);
    console.log(`   PasswordHash length: ${student.passwordHash.length}`);
    
    // Test 2: Verify password
    console.log("\n2. Verifying password...");
    const passwordMatch = await compare("password123", student.passwordHash);
    console.log(`   Password match: ${passwordMatch}`);
  }
  
  process.exit(0);
}

test().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
