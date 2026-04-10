/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const srcDir = '/Users/alfredburgess/Desktop/Pitchside Analytics';
const destDir = '/Users/alfredburgess/Desktop/Pitchside Analytics/dashboard';

// Ensure directories
['public/logos/opponents', 'public/headshots', 'src/data'].forEach((dir) => {
  fs.mkdirSync(path.join(destDir, dir), { recursive: true });
});

// Primary logos
try {
  fs.copyFileSync(path.join(srcDir, 'public/logos/PortlandHearts_logo.png'), path.join(destDir, 'public/PortlandHearts_logo.png'));
  fs.copyFileSync(path.join(srcDir, 'public/logos/USL_League_One_horz_logo.png'), path.join(destDir, 'public/USL_League_One_horz_logo.png'));
  console.log('Copied primary logos');
} catch (e) { console.log('Primary logo copy failed:', e.message); }

// Opponent logos
try {
  const oDir = path.join(srcDir, 'public/logos/opponents');
  fs.readdirSync(oDir).forEach(file => {
    fs.copyFileSync(path.join(oDir, file), path.join(destDir, 'public/logos/opponents', file));
  });
  console.log('Copied opponent logos');
} catch (e) { console.log('Opponent copy failed:', e.message); }

// Headshots
try {
  const hDir = path.join(srcDir, 'usl1_scraper/Player Headshots');
  fs.readdirSync(hDir).forEach(file => {
    if (file.endsWith('.jpg')) {
      fs.copyFileSync(path.join(hDir, file), path.join(destDir, 'public/headshots', file));
    }
  });
  console.log('Copied headshots');
} catch (e) { console.log('Headshot copy failed:', e.message); }

// Tactical JSON
try {
  fs.copyFileSync(path.join(srcDir, 'usl1_scraper/final_tactical_data.json'), path.join(destDir, 'src/data/final_tactical_data.json'));
  console.log('Copied tactical data JSON');
} catch (e) { console.log('JSON copy failed:', e.message); }

// Placeholder logo
try {
  fs.writeFileSync(path.join(destDir, 'public/logos/opponents/usl1_placeholder.png'), 'placeholder content');
  console.log('Created placeholder');
} catch (e) { console.log('Placeholder created failed:', e.message); }

// Clean the Next.js cache so the server picks up new files immediately
try {
    fs.rmSync(path.join(destDir, '.next'), { recursive: true, force: true });
    console.log('Cleared Next.js cache');
} catch (e) { console.log('Clear cache failed:', e.message); }

console.log('All copy tasks executed.');
