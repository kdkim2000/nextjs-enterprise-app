const fs = require('fs');
const path = require('path');

const files = [
  'src/app/[locale]/boards/[boardTypeId]/[postId]/page.tsx',
];

console.log('Removing Container wrapper from all board pages...');
console.log('');

files.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);

  console.log('Processing:', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log('  ✗ File not found');
    return;
  }

  // Read the file
  let content = fs.readFileSync(fullPath, 'utf8');

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
  fs.writeFileSync(fullPath, content, 'utf8');

  console.log('  ✓ Container replaced with Box');
});

console.log('');
console.log('All Container removals complete!');
