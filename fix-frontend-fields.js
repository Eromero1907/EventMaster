const fs = require('fs');

const path = './src/app/admin/eventos/nuevo/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const newDefaultFields = `const DEFAULT_FIELDS: FieldItem[] = [
  { id: "def_1", fieldKey: "fullName", label: "Nombre Completo", fieldType: "text", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_2", fieldKey: "nationalId", label: "Cédula de Ciudadanía / Documento", fieldType: "number", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_3", fieldKey: "epikId", label: "ID de Epik", fieldType: "number", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_4", fieldKey: "eps", label: "EPS", fieldType: "text", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_5", fieldKey: "bloodType", label: "Grupo Sanguíneo y RH", fieldType: "select", optionsInput: "O+, O-, A+, A-, B+, B-, AB+, AB-", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_6", fieldKey: "email", label: "Correo Institucional", fieldType: "email", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_7", fieldKey: "phone", label: "Teléfono Celular / WhatsApp", fieldType: "tel", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_8", fieldKey: "belongsToGroup", label: "¿Pertenece a algún grupo estudiantil?", fieldType: "boolean", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_9", fieldKey: "groupName", label: "En caso afirmativo, ¿a cuál grupo pertenece?", fieldType: "select", optionsInput: "AIESEC, CLUBIN, CLUBMERC, GPG, KRATOS, NEXOS, NOVA, OE, PARTNERS, REPRES, SERES, SPIE, TUTORES, TVU, UN SOCIETY", dependsOn: "belongsToGroup", isRequired: true, isDefault: true },
  { id: "def_10", fieldKey: "hasAllergies", label: "¿Sufres de alguna morbilidad o alergias?", fieldType: "boolean", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_11", fieldKey: "allergiesDetails", label: "¿Cuáles?", fieldType: "text", optionsInput: "", dependsOn: "hasAllergies", isRequired: true, isDefault: true },
];`;

code = code.replace(/const DEFAULT_FIELDS: FieldItem\[\] = \[[\s\S]*?\];/m, newDefaultFields);

fs.writeFileSync(path, code);
console.log("Done updating frontend DEFAULT_FIELDS");
