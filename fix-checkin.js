const fs = require('fs');

// 1. Fix modal colors and text label in checkin page
const pagePath = './src/app/admin/eventos/[id]/checkin/page.tsx';
let pageCode = fs.readFileSync(pagePath, 'utf8');

const oldModalClasses = \`            className={\\\`p-5 rounded-3xl border shadow-xl flex items-start gap-4 transition-all animate-fadeIn \\\${
              scanResult.status === "success"
                ? "bg-sand border-emerald-500/50 text-emerald-100"
                : scanResult.status === "warning"
                ? "bg-amber-950/80 border-amber-500/50 text-amber-100"
                : scanResult.status === "verify"
                ? "bg-sky-950/80 border-terra/50 text-sky-100"
                : "bg-red-950/80 border-red-500/50 text-red-100"
            }\\\`}\`;

const newModalClasses = \`            className={\\\`p-5 rounded-3xl border shadow-xl flex items-start gap-4 transition-all animate-fadeIn \\\${
              scanResult.status === "success"
                ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                : scanResult.status === "warning"
                ? "bg-amber-50 border-amber-500 text-amber-900"
                : scanResult.status === "verify"
                ? "bg-sky-50 border-sky-500 text-sky-900"
                : "bg-red-50 border-red-500 text-red-900"
            }\\\`}\`;

pageCode = pageCode.replace(oldModalClasses, newModalClasses);
pageCode = pageCode.replace('Grupo / Colectivo:', 'Grupo Estudiantil:');
// Fix border-t inside the grid for light mode
pageCode = pageCode.replace('border-t border-white/10', 'border-t border-navy/10');

fs.writeFileSync(pagePath, pageCode);

// 2. Remove emoji in API route
const apiPath = './src/app/api/admin/events/[id]/checkin/route.ts';
let apiCode = fs.readFileSync(apiPath, 'utf8');

apiCode = apiCode.replace(/✅ /g, ''); // Removes the emoji + space globally in that file

fs.writeFileSync(apiPath, apiCode);
console.log("Check-in fixes applied.");
