import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function truncate() {
  console.log("\n=== TRUNCATING DATABASE ===\n");
  
  try {
    // Delete in correct order to avoid foreign key conflicts
    await prisma.roomChangeRequest.deleteMany({});
    console.log("✓ Deleted room change requests");
    
    await prisma.feePayment.deleteMany({});
    console.log("✓ Deleted fee payments");
    
    await prisma.feeInvoice.deleteMany({});
    console.log("✓ Deleted fee invoices");
    
    await prisma.roomAllocation.deleteMany({});
    console.log("✓ Deleted room allocations");
    
    await prisma.compatibilityScore.deleteMany({});
    console.log("✓ Deleted compatibility scores");
    
    await prisma.studentCharacteristics.deleteMany({});
    console.log("✓ Deleted student characteristics");
    
    await prisma.student.deleteMany({});
    console.log("✓ Deleted students");
    
    await prisma.adminUser.deleteMany({});
    console.log("✓ Deleted admin users");
    
    await prisma.hostelFeePlan.deleteMany({});
    console.log("✓ Deleted fee plans");
    
    await prisma.room.deleteMany({});
    console.log("✓ Deleted rooms");
    
    await prisma.hostelBlock.deleteMany({});
    console.log("✓ Deleted blocks");
    
    // Reset room status
    await prisma.$executeRaw`
      ALTER SEQUENCE IF EXISTS rooms_id_seq RESTART WITH 1;
    `;
    
    console.log("\n✓ Database truncated!\n");
    
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

truncate();
