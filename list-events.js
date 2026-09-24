const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const events = await prisma.event.findMany({ include: { shifts: true } });
  for (const e of events) {
    console.log(`Event: ${e.title} | hasShifts: ${e.hasShifts} | DB Shifts length: ${e.shifts.length}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
