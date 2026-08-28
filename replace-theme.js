const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const replacements = [
  // Backgrounds
  [/bg-slate-950/g, 'bg-cream'],
  [/bg-slate-900\/80/g, 'bg-white'],
  [/bg-slate-900\/60/g, 'bg-sand'],
  [/bg-slate-900/g, 'bg-white'],
  [/bg-slate-800\/60/g, 'bg-sand'],
  [/bg-slate-800/g, 'bg-white'],
  [/bg-slate-50/g, 'bg-cream'],
  [/bg-slate-100/g, 'bg-sand'],
  
  // Borders
  [/border-slate-800\/60/g, 'border-sand'],
  [/border-slate-800/g, 'border-sand'],
  [/border-slate-700/g, 'border-sand'],
  [/border-slate-200/g, 'border-sand'],
  [/border-slate-100/g, 'border-sand'],
  [/divide-slate-800/g, 'divide-sand'],
  [/divide-slate-100/g, 'divide-sand'],

  // Texts
  [/text-white/g, 'text-navy'],
  [/text-slate-100/g, 'text-navy'],
  [/text-slate-200/g, 'text-navy'],
  [/text-slate-300/g, 'text-slateblue'],
  [/text-slate-400/g, 'text-steel'],
  [/text-slate-500/g, 'text-steel'],
  [/text-slate-900/g, 'text-navy'],
  [/text-slate-800/g, 'text-navy'],
  
  // Hovers
  [/hover:bg-slate-800/g, 'hover:bg-sand'],
  [/hover:bg-slate-700/g, 'hover:bg-sand'],
  [/hover:text-white/g, 'hover:text-navy'],
  [/hover:text-sky-400/g, 'hover:text-terra'],

  // Primary brand colors (Sky -> Terra)
  [/bg-sky-600/g, 'bg-terra text-white'],
  [/bg-sky-500/g, 'bg-sienna text-white'],
  [/text-sky-600/g, 'text-terra'],
  [/text-sky-500/g, 'text-sienna'],
  [/text-sky-400/g, 'text-sienna'],
  [/text-sky-300/g, 'text-sienna'],
  [/border-sky-500/g, 'border-terra'],
  [/border-sky-200/g, 'border-sand'],
  [/bg-sky-50/g, 'bg-sand'],
  [/shadow-sky-600\/30/g, 'shadow-terra/30'],

  // Emerald/Success -> Gold
  [/text-emerald-400/g, 'text-gold'],
  [/text-emerald-500/g, 'text-gold'],
  [/text-emerald-600/g, 'text-gold'],
  [/text-emerald-700/g, 'text-gold'],
  [/bg-emerald-50/g, 'bg-sand'],
  [/border-emerald-200/g, 'border-ochre'],
  [/bg-emerald-100/g, 'bg-sand'],
  [/bg-emerald-950\/80/g, 'bg-sand'],
  [/text-emerald-300/g, 'text-gold'],
  [/border-emerald-800\/60/g, 'border-ochre'],

  // Gradients
  [/from-sky-900/g, 'from-cream'],
  [/via-slate-900/g, 'via-sand'],
  [/to-slate-950/g, 'to-cream'],
];

const files = walkSync('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  replacements.forEach(([regex, replaceStr]) => {
    newContent = newContent.replace(regex, replaceStr);
  });

  // Fix buttons that ended up with "text-navy text-white" due to multiple replacements
  newContent = newContent.replace(/text-navy text-white/g, 'text-white');
  newContent = newContent.replace(/text-white text-navy/g, 'text-white');

  // Fix Dalek Pinpoint font class insertion for titles
  // We look for h1, h2, h3 and add font-display
  newContent = newContent.replace(/<h1 className="([^"]+)"/g, '<h1 className="$1 font-display"');
  newContent = newContent.replace(/<h2 className="([^"]+)"/g, '<h2 className="$1 font-display"');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated:', file);
  }
});
