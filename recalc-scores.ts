import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function recalculate() {
  console.log("\n=== RECALCULATING COMPATIBILITY SCORES ===\n");
  
  try {
    // Get all students with characteristics
    const students = await prisma.student.findMany({
      where: { characteristics: { isNot: null } },
      select: { id: true }
    });
    
    console.log(`Found ${students.length} students with characteristics\n`);
    
    // Manually call the PostgreSQL function for each pair
    const result = await prisma.$queryRaw`
      DELETE FROM compatibility_scores;
    `;
    
    console.log("✓ Deleted old compatibility scores");
    
    // Recalculate all scores using raw SQL paired query
    const insertResult = await prisma.$queryRaw`
      INSERT INTO compatibility_scores (student_a_id, student_b_id, total_score, academic_score, sleep_score, hobby_score, lifestyle_score, food_score, environment_score)
      SELECT DISTINCT
        LEAST(sc1.student_id, sc2.student_id) as student_a_id,
        GREATEST(sc1.student_id, sc2.student_id) as student_b_id,
        calculate_compatibility(sc1.student_id, sc2.student_id) as total_score,
        0, 0, 0, 0, 0, 0
      FROM student_characteristics sc1
      CROSS JOIN student_characteristics sc2
      WHERE sc1.student_id < sc2.student_id
    `;
    
    // Count inserted scores
    const count = await prisma.compatibilityScore.count();
    console.log(`✓ Inserted $(count) compatibility scores\n`);
    
    // Get a sample
    const sample = await prisma.compatibilityScore.findFirst();
    if (sample) {
      console.log(`✓ Sample score calculated: ${sample.totalScore}`);
    }
    
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

recalculate();
