const fs = require('fs');
const path = './src/components/QRScanner.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'oscillator.start();',
  'oscillator.start();\n      if (navigator.vibrate) navigator.vibrate(100); // Vibración de 100ms'
);

fs.writeFileSync(path, code);
console.log("Vibration added");
