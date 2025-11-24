const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'boards', '[boardTypeId]', 'page.tsx');

console.log('Fixing Home button route...');
console.log('File:', filePath);

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix Home button - more specific pattern
const before = content;
content = content.replace(
  'onClick={() => router.push()}',
  'onClick={() => router.push(`/${currentLocale}`)}'
);

if (before !== content) {
  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Fixed Home button route');
} else {
  console.log('✗ Home button pattern not found');
}

console.log('');
console.log('Home button fix complete!');
