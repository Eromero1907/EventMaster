const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    where: { hasShifts: true },
    include: {
      registrations: {
        include: { shift: true }
      }
    }
  });
  
  for (const e of events) {
    console.log(`Event: ${e.title}`);
    let missingShiftCount = 0;
    let hasShiftCount = 0;
    for (const r of e.registrations) {
      if (!r.shiftId) {
        missingShiftCount++;
      } else {
        hasShiftCount++;
      }
    }
    console.log(`  Registrations with shiftId: ${hasShiftCount}`);
    console.log(`  Registrations WITHOUT shiftId: ${missingShiftCount}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
