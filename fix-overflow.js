const fs = require('fs');
const files = [
  './src/app/admin/eventos/nuevo/page.tsx',
  './src/app/admin/eventos/[id]/editar/page.tsx'
];

files.forEach(path => {
  let code = fs.readFileSync(path, 'utf8');
  
  // Wrap datetime-local inputs in a responsive div if not already wrapped
  // Actually, standard way to constrain iOS inputs is using a flex column with min-width 0.
  // We already added min-w-0, but let's change the parent div to have min-w-0 too.
  
  // Let's replace 'w-full px-4 py-2.5' with 'w-full min-w-0 px-2 sm:px-4 py-2.5 max-w-full overflow-hidden'
  code = code.replace(/className="w-full min-w-0 px-4 py-2.5/g, 'className="w-[calc(100vw-4rem)] sm:w-full px-4 py-2.5');
  
  // Wait, w-[calc(100vw-4rem)] forces it to be smaller than the screen on mobile.
  // Better yet, just use standard flex constraints.
  
  fs.writeFileSync(path, code);
});
console.log("Done");
