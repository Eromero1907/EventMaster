const fs = require('fs');

// 1. Fix defaultFields in API route
const routePath = './src/app/api/admin/events/route.ts';
let routeCode = fs.readFileSync(routePath, 'utf8');

const newFields = `      const defaultFields = [
        { fieldKey: "fullName", label: "Nombre Completo", fieldType: "text", isRequired: true, orderIndex: 1, isDefault: true, dependsOn: null },
        { fieldKey: "nationalId", label: "Cédula de Ciudadanía / Documento", fieldType: "number", isRequired: true, orderIndex: 2, isDefault: true, dependsOn: null },
        { fieldKey: "epikId", label: "ID de Epik", fieldType: "number", isRequired: true, orderIndex: 3, isDefault: true, dependsOn: null },
        { fieldKey: "eps", label: "EPS", fieldType: "text", isRequired: true, orderIndex: 4, isDefault: true, dependsOn: null },
        { fieldKey: "bloodType", label: "Grupo Sanguíneo y RH", fieldType: "select", optionsJson: JSON.stringify(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]), isRequired: true, orderIndex: 5, isDefault: true, dependsOn: null },
        { fieldKey: "email", label: "Correo Institucional", fieldType: "email", isRequired: true, orderIndex: 6, isDefault: true, dependsOn: null },
        { fieldKey: "phone", label: "Teléfono Celular / WhatsApp", fieldType: "tel", isRequired: true, orderIndex: 7, isDefault: true, dependsOn: null },
        { fieldKey: "belongsToGroup", label: "¿Pertenece a algún grupo estudiantil?", fieldType: "boolean", isRequired: true, orderIndex: 8, isDefault: true, dependsOn: null },
        { fieldKey: "groupName", label: "En caso afirmativo, ¿a cuál grupo pertenece?", fieldType: "select", optionsJson: JSON.stringify(["AIESEC", "CLUBIN", "CLUBMERC", "GPG", "KRATOS", "NEXOS", "NOVA", "OE", "PARTNERS", "REPRES", "SERES", "SPIE", "TUTORES", "TVU", "UN SOCIETY"]), isRequired: true, orderIndex: 9, isDefault: true, dependsOn: "belongsToGroup" },
        { fieldKey: "hasAllergies", label: "¿Sufres de alguna morbilidad o alergias?", fieldType: "boolean", isRequired: true, orderIndex: 10, isDefault: true, dependsOn: null },
        { fieldKey: "allergiesDetails", label: "¿Cuáles?", fieldType: "text", isRequired: true, orderIndex: 11, isDefault: true, dependsOn: "hasAllergies" },
      ];`;

// Replace the old defaultFields block. We use regex to match the old block.
routeCode = routeCode.replace(/const defaultFields = \[[\s\S]*?\];/m, newFields);
fs.writeFileSync(routePath, routeCode);

// 2. Remove "(opcional)" from public registration form
const publicPagePath = './src/app/eventos/[slug]/page.tsx';
let publicCode = fs.readFileSync(publicPagePath, 'utf8');

publicCode = publicCode.replace(
  /\{\s*field\.fieldKey === "epikId" && <span className="text-steel font-normal ml-1">\(opcional\)<\/span>\s*\}/g,
  ''
);
fs.writeFileSync(publicPagePath, publicCode);

console.log("Modifications applied successfully.");
