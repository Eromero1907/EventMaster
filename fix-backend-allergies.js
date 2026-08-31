const fs = require('fs');

function patchRoute(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Find where customAnswers is destructured and add hasAllergies, allergiesDetails
  if (code.includes('customAnswers,')) {
    code = code.replace(
      'customAnswers,',
      'customAnswers,\n      hasAllergies,\n      allergiesDetails,'
    );
  }
  
  // Replace customAnswersJson
  code = code.replace(
    /customAnswersJson: customAnswers \? JSON.stringify\(customAnswers\) : "\{\}",/,
    'customAnswersJson: JSON.stringify({ ...(customAnswers || {}), hasAllergies, allergiesDetails }),'
  );
  
  fs.writeFileSync(filePath, code);
}

patchRoute('./src/app/api/events/[slug]/register/route.ts');
patchRoute('./src/app/api/admin/events/[id]/manual-register/route.ts');

console.log("Backend routes patched!");
