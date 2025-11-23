const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'boards', 'PostFormPage.tsx');

console.log('Removing Container wrapper from PostFormPage...');
console.log('File:', filePath);

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Remove Container from imports
content = content.replace(
  /,\s*Container,/g,
  ','
);

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

console.log('✓ Removed Container from imports');
console.log('✓ Replaced Container with Box');
console.log('');
console.log('PostFormPage Container removal complete!');
