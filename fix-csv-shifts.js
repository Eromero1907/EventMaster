const fs = require('fs');
const path = './src/app/api/admin/events/[id]/export/route.ts';

let code = fs.readFileSync(path, 'utf8');

// 1. Include the shift relation
code = code.replace(
  'registrations: {\\n          orderBy: [{ checkedIn: "desc" }, { createdAt: "asc" }],\\n        },',
  'registrations: {\\n          orderBy: [{ checkedIn: "desc" }, { createdAt: "asc" }],\\n          include: { shift: true },\\n        },'
);
// Alternative since regex with whitespace can be tricky:
code = code.replace(
  'orderBy: [{ checkedIn: "desc" }, { createdAt: "asc" }],\n        },',
  'orderBy: [{ checkedIn: "desc" }, { createdAt: "asc" }],\n          include: { shift: true },\n        },'
);

// 2. Add Turno to headers conditionally
const headersReplacement = `
    const headers = [
      "Estado Asistencia",
      "Fecha y Hora Check-in",
      "Código Boleto",
      "Cédula / Documento",
      "Nombre Completo",
      "Correo Institucional",
      "ID Epik",
      "Celular",
      "EPS",
      "Grupo Sanguíneo",
      "Pertenece a Grupo",
      "Nombre del Grupo",
      "Sufre Morbilidades/Alergias",
      "Detalle Alergias",
      ...(event.hasShifts ? ["Turno"] : []),
      "Tipo de Registro",
      "Fecha de Registro",
      ...customFields.map((f) => \`"\${f.label.replace(/"/g, '""')}"\`),
    ];
`;

code = code.replace(
  /const headers = \[\s*"Estado Asistencia",[\s\S]*?\.\.\.customFields\.map\(\(f\) => `"\$\{f\.label\.replace\(\/"\/g, '""'\)\}"`\),\s*\];/,
  headersReplacement.trim()
);

// 3. Add shift name to rows conditionally
const rowsReplacement = `
      return [
        reg.checkedIn ? '"ASISTIÓ"' : '"INASISTENTE"',
        reg.checkedInAt
          ? escapeCsv(
              new Intl.DateTimeFormat("es-CO", {
                dateStyle: "short",
                timeStyle: "medium",
              }).format(new Date(reg.checkedInAt))
            )
          : '""',
        escapeCsv(reg.ticketCode),
        escapeCsv(reg.nationalId),
        escapeCsv(reg.fullName),
        escapeCsv(reg.email),
        escapeCsv(reg.epikId || "N/A"),
        escapeCsv(reg.phone || "N/A"),
        escapeCsv(reg.eps || "N/A"),
        escapeCsv(reg.bloodType || "N/A"),
        reg.belongsToGroup ? '"SÍ"' : '"NO"',
        escapeCsv(reg.groupName || "N/A"),
        customAnswers.hasAllergies ? '"SÍ"' : '"NO"',
        escapeCsv(customAnswers.allergiesDetails || "N/A"),
        ...(event.hasShifts ? [escapeCsv(reg.shift?.name || "N/A")] : []),
        reg.isManualEntry ? '"Manual en puerta"' : '"Anticipado en línea"',
        escapeCsv(
          new Intl.DateTimeFormat("es-CO", {
            dateStyle: "short",
            timeStyle: "medium",
          }).format(new Date(reg.createdAt))
        ),
        ...customAnswersList,
      ].join(";");
`;

code = code.replace(
  /return \[\s*reg\.checkedIn \? '"ASISTIÓ"' : '"INASISTENTE"',[\s\S]*?\.\.\.customAnswersList,\s*\]\.join\(";"\);/,
  rowsReplacement.trim()
);

fs.writeFileSync(path, code);
console.log("CSV Export updated!");
