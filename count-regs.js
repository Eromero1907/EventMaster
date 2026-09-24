const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const events = await prisma.event.findMany({ include: { registrations: true } });
  for (const e of events) {
    console.log(`Event: ${e.title} | Registrations: ${e.registrations.length}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
