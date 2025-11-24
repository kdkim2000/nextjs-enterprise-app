const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'boards', '[boardTypeId]', 'page.tsx');

console.log('Removing Container wrapper from board list page...');
console.log('File:', filePath);

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace Container maxWidth="lg" with Box
content = content.replace(
  /<Container maxWidth="lg" sx=\{\{ py: 4 \}\}>/g,
  '<Box sx={{ py: 4 }}>'
);

// Replace closing Container with Box
content = content.replace(
  /<\/Container>/g,
  '</Box>'
);

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✓ Replaced Container with Box');
console.log('');
console.log('Container removal complete!');
