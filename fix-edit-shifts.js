const fs = require('fs');
const path = './src/app/api/admin/events/[id]/route.ts';
let code = fs.readFileSync(path, 'utf8');

const oldShiftsLogic = `
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

const newShiftsLogic = `
    // Actualizar turnos conservando las IDs para no perder inscripciones
    if (hasShifts !== undefined) {
      if (!hasShifts || !Array.isArray(shifts) || shifts.length === 0) {
        await prisma.shift.deleteMany({ where: { eventId: params.id } });
      } else {
        const existingIds = shifts.map((s: any) => s.id).filter((id: string) => id && !id.startsWith("temp_") && !id.startsWith("s1"));
        
        // Eliminar los turnos que ya no están en la lista
        await prisma.shift.deleteMany({
          where: {
            eventId: params.id,
            id: { notIn: existingIds.length > 0 ? existingIds : ["dummy"] },
          },
        });

        // Upsert para cada turno
        for (const s of shifts) {
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

          if (s.id && !s.id.startsWith("temp_") && !s.id.startsWith("s1")) {
            // Actualizar existente
            await prisma.shift.update({
              where: { id: s.id },
              data: {
                name: s.name,
                startTime: parsedStart,
                endTime: parsedEnd,
              }
            });
          } else {
            // Crear nuevo
            await prisma.shift.create({
              data: {
                eventId: params.id,
                name: s.name,
                startTime: parsedStart,
                endTime: parsedEnd,
              }
            });
          }
        }
      }
    }
`;

code = code.replace(oldShiftsLogic.trim(), newShiftsLogic.trim());
fs.writeFileSync(path, code);
console.log("Edit Shifts logic fixed!");
