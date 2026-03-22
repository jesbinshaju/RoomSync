import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearAllocations() {
  console.log("\n=== CLEARING OLD ALLOCATIONS ===\n");
  
  try {
    // Delete all allocations
    const deleted = await prisma.roomAllocation.deleteMany({});
    console.log(`✓ Deleted ${deleted.count} allocations`);
    
    // Reset all rooms to available
    const updated = await prisma.room.updateMany({
      data: { status: "available" }
    });
    console.log(`✓ Reset ${updated.count} rooms to available`);
    
    console.log("\n✓ Database cleared! Now run allocation and it will match based on characteristics.\n");
    
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllocations();
