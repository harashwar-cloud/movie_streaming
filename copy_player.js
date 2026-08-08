const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src', 'components', 'VideoPlayer2.tsx');
const dest = path.join(__dirname, 'src', 'components', 'VideoPlayer.tsx');

const content = fs.readFileSync(src, 'utf8');
fs.writeFileSync(dest, content, 'utf8');
console.log('Successfully copied VideoPlayer2.tsx to VideoPlayer.tsx with UTF-8 encoding!');
