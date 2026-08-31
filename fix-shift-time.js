const fs = require('fs');

function formatFile(path) {
  let code = fs.readFileSync(path, 'utf8');
  
  // Add a helper function after the imports if it's the public page
  if (!code.includes('const formatShiftTime')) {
    code = code.replace(
      'export default function',
      'const formatShiftTime = (iso: string | null | undefined) => { if (!iso) return "--:--"; try { return new Date(iso).toISOString().substring(11, 16); } catch (e) { return "--:--"; } };\n\nexport default function'
    );
  }

  // Replace {shift.startTime} with {formatShiftTime(shift.startTime)}
  // For public page:
  code = code.replace(
    /\{shift\.startTime \|\| '--:--'\} - \{shift\.endTime \|\| '--:--'\}/g,
    '{formatShiftTime(shift.startTime)} - {formatShiftTime(shift.endTime)}'
  );
  
  // For manual checkin page:
  code = code.replace(
    /\{shift\.name\} \{shift\.startTime \? \`\(\$\{shift\.startTime\}\)\` : ''\}/g,
    '{shift.name} {shift.startTime ? `(${formatShiftTime(shift.startTime)})` : ""}'
  );

  fs.writeFileSync(path, code);
}

formatFile('./src/app/eventos/[slug]/page.tsx');
formatFile('./src/app/admin/eventos/[id]/checkin/page.tsx');

console.log("Shift times formatted!");
