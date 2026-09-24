const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const event = await prisma.event.findFirst({
    where: { hasShifts: true },
    include: { shifts: true }
  });
  
  if (!event) {
    console.log("No events with shifts found");
    return;
  }
  
  console.log(`Found event: ${event.title}, ID: ${event.id}`);
  console.log(`Shifts:`, event.shifts.map(s => ({ id: s.id, name: s.name })));
  
  // Try to create a dummy registration via prisma directly
  const dummyReg = await prisma.registration.create({
    data: {
      eventId: event.id,
      shiftId: event.shifts[0].id,
      ticketCode: 'DUMMY-' + Date.now(),
      fullName: 'Test Dummy',
      email: 'dummy@test.com',
      nationalId: '123456789',
    }
  });
  
  console.log(`Created registration with shiftId: ${dummyReg.shiftId}`);
  
  // Clean up
  await prisma.registration.delete({ where: { id: dummyReg.id } });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
