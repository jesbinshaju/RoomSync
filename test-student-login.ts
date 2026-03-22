import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

async function test() {
  console.log("\n=== STUDENT LOGIN TEST ===\n");
  
  const email = "male1@test.com";
  const password = "password123";
  
  // Check if student exists
  const student = await prisma.student.findUnique({
    where: { email, isActive: true }
  });
  
  if (!student) {
    console.log(`✗ Student ${email} not found or inactive`);
    
    // Try to find without isActive filter
    const anyStudent = await prisma.student.findUnique({
      where: { email }
    });
    
    if (anyStudent) {
      console.log(`  Found but inactive: isActive = ${anyStudent.isActive}`);
    } else {
      console.log(`  Not found at all in database`);
    }
  } else {
    console.log(`✓ Student found: ${student.fullName}`);
    console.log(`  Email: ${student.email}`);
    console.log(`  ID: ${student.id}`);
    
    // Check password
    const passwordMatch = await compare(password, student.passwordHash);
    console.log(`  Password valid: ${passwordMatch}`);
  }
  
  // List all students to verify they exist
  const count = await prisma.student.count();
  console.log(`\n✓ Total students in DB: ${count}`);
  
  const firstFive = await prisma.student.findMany({
    select: { email: true, isActive: true },
    take: 5
  });
  
  console.log("  Sample students:");
  firstFive.forEach(s => {
    console.log(`    - ${s.email} (active: ${s.isActive})`);
  });
  
  await prisma.$disconnect();
}

test().catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
