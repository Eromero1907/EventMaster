const fs = require('fs');
const path = './src/app/api/admin/events/[id]/route.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'const { title, description, location, startDate, endDate, maxCapacity, isPublished, fields } = body;',
  'const { title, description, location, startDate, endDate, maxCapacity, isPublished, fields, hasShifts, shifts } = body;'
);

code = code.replace(
  'isPublished: isPublished !== undefined ? isPublished : undefined,',
  `isPublished: isPublished !== undefined ? isPublished : undefined,
        hasShifts: hasShifts !== undefined ? Boolean(hasShifts) : undefined,`
);

const shiftUpdateLogic = `
    // Actualizar turnos
    if (hasShifts !== undefined) {
      await prisma.shift.deleteMany({
        where: { eventId: params.id },
      });
      if (hasShifts && Array.isArray(shifts) && shifts.length > 0) {
        await prisma.shift.createMany({
          data: shifts.map((s: any) => {
            let parsedStart = null;
            let parsedEnd = null;
            if (s.startTime) {
              const parts = s.startTime.split(":");
              parsedStart = new Date(\`1970-01-01T\${parts[0]}:\${parts[1]}:00Z\`);
            }
            if (s.endTime) {
              const parts = s.endTime.split(":");
              parsedEnd = new Date(\`1970-01-01T\${parts[0]}:\${parts[1]}:00Z\`);
            }
            return {
              eventId: params.id,
              name: s.name,
              startTime: parsedStart,
              endTime: parsedEnd,
            };
          }),
        });
      }
    }
`;

code = code.replace(
  '    // Si se enviaron campos/preguntas para actualizar o añadir',
  shiftUpdateLogic + '\n    // Si se enviaron campos/preguntas para actualizar o añadir'
);

// We also need to fetch shifts in GET
code = code.replace(
  'orderBy: { orderIndex: "asc" },\n        },',
  'orderBy: { orderIndex: "asc" },\n        },\n        shifts: {\n          orderBy: { startTime: "asc" },\n        },'
);

fs.writeFileSync(path, code);
console.log('Fixed api route');
