import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  console.log("\n=== COMPATIBILITY SCORES CHECK ===\n");
  
  // Check if scores exist
  const scoreCount = await prisma.compatibilityScore.count();
  console.log(`Total compatibility scores in DB: ${scoreCount}`);
  
  if (scoreCount === 0) {
    console.log("❌ NO COMPATIBILITY SCORES FOUND\n");
    console.log("This is the problem! The algorithm needs pre-calculated scores.");
    console.log("Scores should be calculated when students add their characteristics.\n");
    
    // Get student count with characteristics
    const studentCount = await prisma.student.count({
      where: { characteristics: { isNot: null } }
    });
    console.log(`Students with characteristics: ${studentCount}`);
    console.log(`Expected pairs: ${(studentCount * (studentCount - 1)) / 2} scores`);
    
  } else {
    console.log(`✓ Found scores\n`);
    const sample = await prisma.compatibilityScore.findFirst({
      include: { 
        studentA: { select: { email: true } },
        studentB: { select: { email: true } }
      }
    });
    if (sample) {
      console.log("Sample score:");
      console.log(`  ${sample.studentA?.email} <-> ${sample.studentB?.email}: ${sample.totalScore}`);
    }
  }
  
  await prisma.$disconnect();
}

check().catch(console.error);
