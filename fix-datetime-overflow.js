const fs = require('fs');
const files = [
  './src/app/admin/eventos/nuevo/page.tsx',
  './src/app/admin/eventos/[id]/editar/page.tsx'
];

files.forEach(path => {
  let code = fs.readFileSync(path, 'utf8');

  // Find the grid container for dates and add min-w-0 to the children divs
  // It looks like:
  // <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  //   <div>
  //     <label className="block text-xs font-semibold text-slateblue mb-1.5">
  //       Fecha y Hora de Inicio
  
  // We can just add min-w-0 to ALL child divs of those grids by doing a global replace on the input classes,
  // making sure they really shrink.

  // Restore the normal w-full, but add min-w-0 and max-w-full
  code = code.replace(/className="w-\[calc\(100vw-4rem\)\] sm:w-full/g, 'className="w-full min-w-0 max-w-[100%] overflow-hidden');
  
  // Actually, wait, let's just use a very explicit inline style: style={{ width: '100%', maxWidth: '100%' }}
  
  // Let's replace the grid div wrapping the dates:
  code = code.replace(
    /<div>\s*<label className="block text-xs font-semibold text-slateblue mb-1.5">\s*Fecha y Hora/g,
    '<div className="min-w-0 w-full">\n                  <label className="block text-xs font-semibold text-slateblue mb-1.5">\n                    Fecha y Hora'
  );

  fs.writeFileSync(path, code);
});
console.log("Done");
