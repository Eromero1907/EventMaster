const fs = require('fs');
const path = './src/app/api/events/[slug]/route.ts';
let code = fs.readFileSync(path, 'utf8');

const replacement = `
    const shiftCount = event.shifts?.length || 0;
    const effectiveCapacity = event.hasShifts && shiftCount > 0 ? event.maxCapacity * shiftCount : event.maxCapacity;
    const remainingSpots = Math.max(0, effectiveCapacity - totalRegistrations);
`;

code = code.replace(
  'const remainingSpots = Math.max(0, event.maxCapacity - totalRegistrations);',
  replacement.trim()
);

fs.writeFileSync(path, code);
console.log("API Event public route fixed!");
