const fs = require('fs');

const helperCode = `const formatShiftTime = (iso: string | null | undefined) => {
  if (!iso) return "--:--";
  try {
    const d = new Date(iso);
    let hours = d.getUTCHours();
    const minutes = d.getUTCMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = hours.toString().padStart(2, "0");
    return \`\${hoursStr}:\${minutes} \${ampm}\`;
  } catch (e) {
    return "--:--";
  }
};`;

function formatFile(path) {
  let code = fs.readFileSync(path, 'utf8');
  
  // Replace the old one-liner helper with the new one
  const oldHelperRegex = /const formatShiftTime = \(iso: string \| null \| undefined\) => \{ if \(\!iso\) return "--:--"; try \{ return new Date\(iso\)\.toISOString\(\)\.substring\(11, 16\); \} catch \(e\) \{ return "--:--"; \} \};/g;
  
  code = code.replace(oldHelperRegex, helperCode);
  fs.writeFileSync(path, code);
}

formatFile('./src/app/eventos/[slug]/page.tsx');
formatFile('./src/app/admin/eventos/[id]/checkin/page.tsx');

console.log("Shift times formatted to AM/PM!");
