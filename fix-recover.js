const fs = require('fs');
const path = './src/app/api/tickets/recover/route.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'email: email.trim().toLowerCase(),',
  'email: email.trim().toLowerCase(),\n        isCancelled: false,'
);

fs.writeFileSync(path, code);
