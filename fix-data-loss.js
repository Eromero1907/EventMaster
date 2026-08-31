const fs = require('fs');

// Fix 1: Public Registration
const pubRegPath = './src/app/api/events/[slug]/register/route.ts';
let pubReg = fs.readFileSync(pubRegPath, 'utf8');

pubReg = pubReg.replace(
  'customAnswersJson: JSON.stringify(customAnswers || {}),',
  `customAnswersJson: JSON.stringify({ ...(customAnswers || {}), hasAllergies: body.hasAllergies, allergiesDetails: body.allergiesDetails }),`
);
fs.writeFileSync(pubRegPath, pubReg);

// Fix 2: Manual Registration
const manRegPath = './src/app/api/admin/events/[id]/manual-register/route.ts';
let manReg = fs.readFileSync(manRegPath, 'utf8');

manReg = manReg.replace(
  'customAnswersJson: JSON.stringify(customAnswers || {}),',
  `customAnswersJson: JSON.stringify({ ...(customAnswers || {}), hasAllergies: body.hasAllergies, allergiesDetails: body.allergiesDetails }),`
);
fs.writeFileSync(manRegPath, manReg);

console.log("Fixed data loss on both endpoints.");
