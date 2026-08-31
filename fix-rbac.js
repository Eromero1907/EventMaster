const fs = require('fs');

const staffBlockCode = `  if (session.role === "STAFF") {
    return NextResponse.json({ error: "Acceso denegado. Tu rol de STAFF no permite esta acción." }, { status: 403 });
  }`;
const staffBlockExport = `  if (session.role === "STAFF") {
    return new NextResponse("Acceso denegado. Tu rol de STAFF no permite descargar reportes.", { status: 403 });
  }`;

// 1. Users API (GET & POST)
let usersCode = fs.readFileSync('./src/app/api/admin/users/route.ts', 'utf8');
usersCode = usersCode.replace(
  /if \(\!session\) \{\n    return NextResponse\.json\(\{ error: "No autorizado" \}, \{ status: 401 \}\);\n  \}/g,
  `if (!session) {\n    return NextResponse.json({ error: "No autorizado" }, { status: 401 });\n  }\n${staffBlockCode}`
);
fs.writeFileSync('./src/app/api/admin/users/route.ts', usersCode);

// 2. Events API - Create (POST only)
let eventsCode = fs.readFileSync('./src/app/api/admin/events/route.ts', 'utf8');
eventsCode = eventsCode.replace(
  /export async function POST\(req: NextRequest\) \{\n  const session = await authenticateRequest\(req\);\n  if \(\!session\) \{\n    return NextResponse\.json\(\{ error: "No autorizado" \}, \{ status: 401 \}\);\n  \}/g,
  `export async function POST(req: NextRequest) {\n  const session = await authenticateRequest(req);\n  if (!session) {\n    return NextResponse.json({ error: "No autorizado" }, { status: 401 });\n  }\n${staffBlockCode}`
);
fs.writeFileSync('./src/app/api/admin/events/route.ts', eventsCode);

// 3. Single Event API - Update/Delete (PUT & DELETE)
let eventIdCode = fs.readFileSync('./src/app/api/admin/events/[id]/route.ts', 'utf8');
eventIdCode = eventIdCode.replace(
  /export async function PUT\(req: NextRequest, \{ params \}: \{ params: \{ id: string \} \}\) \{\n  const session = await authenticateRequest\(req\);\n  if \(\!session\) \{\n    return NextResponse\.json\(\{ error: "No autorizado" \}, \{ status: 401 \}\);\n  \}/g,
  `export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {\n  const session = await authenticateRequest(req);\n  if (!session) {\n    return NextResponse.json({ error: "No autorizado" }, { status: 401 });\n  }\n${staffBlockCode}`
);
eventIdCode = eventIdCode.replace(
  /export async function DELETE\(req: NextRequest, \{ params \}: \{ params: \{ id: string \} \}\) \{\n  const session = await authenticateRequest\(req\);\n  if \(\!session\) \{\n    return NextResponse\.json\(\{ error: "No autorizado" \}, \{ status: 401 \}\);\n  \}/g,
  `export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {\n  const session = await authenticateRequest(req);\n  if (!session) {\n    return NextResponse.json({ error: "No autorizado" }, { status: 401 });\n  }\n${staffBlockCode}`
);
fs.writeFileSync('./src/app/api/admin/events/[id]/route.ts', eventIdCode);

// 4. Export CSV (GET)
let exportCode = fs.readFileSync('./src/app/api/admin/events/[id]/export/route.ts', 'utf8');
exportCode = exportCode.replace(
  /if \(\!session\) \{\n    return new NextResponse\("No autorizado", \{ status: 401 \}\);\n  \}/g,
  `if (!session) {\n    return new NextResponse("No autorizado", { status: 401 });\n  }\n${staffBlockExport}`
);
fs.writeFileSync('./src/app/api/admin/events/[id]/export/route.ts', exportCode);

console.log("RBAC applied successfully.");
