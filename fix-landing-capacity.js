const fs = require('fs');
const path = './src/app/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix the Prisma query to include shifts and only count non-cancelled registrations
code = code.replace(
  'select: { registrations: true },',
  'select: { registrations: { where: { isCancelled: false } } },\n        },\n        shifts: true,'
);

// 2. Fix the capacity calculation
code = code.replace(
  'const capacity = event.maxCapacity;',
  'const shiftCount = event.shifts?.length || 0;\n              const capacity = event.hasShifts && shiftCount > 0 ? event.maxCapacity * shiftCount : event.maxCapacity;'
);

fs.writeFileSync(path, code);
console.log("Landing page fixed!");
