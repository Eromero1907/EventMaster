const fs = require('fs');

const path = './src/app/admin/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// I need to wrap the button and the `<>` into a single `<>` block
code = code.replace(
  '{admin?.role !== "STAFF" && (\n                          <button',
  '{admin?.role !== "STAFF" && (\n                          <>\n                            <button'
);

// We don't need to replace the inner `<>` because it's harmless, but it's cleaner to remove the inner `<>` and `</>`
code = code.replace(
  '</button>\n\n                          <>',
  '</button>'
);

fs.writeFileSync(path, code);
