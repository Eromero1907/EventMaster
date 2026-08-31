const fs = require('fs');

const exportPath = './src/app/api/admin/events/[id]/export/route.ts';
let exportCode = fs.readFileSync(exportPath, 'utf8');

// Replace headers
exportCode = exportCode.replace(
  '"Nombre del Grupo",',
  `"Nombre del Grupo",\n      "Sufre Morbilidades/Alergias",\n      "Detalle Alergias",`
);

// Replace rows
exportCode = exportCode.replace(
  'escapeCsv(reg.groupName || "N/A"),',
  `escapeCsv(reg.groupName || "N/A"),\n        customAnswers.hasAllergies ? '"SÍ"' : '"NO"',\n        escapeCsv(customAnswers.allergiesDetails || "N/A"),`
);

fs.writeFileSync(exportPath, exportCode);
console.log("Fixed CSV export to include allergies.");
