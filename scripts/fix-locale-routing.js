const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'boards', '[boardTypeId]', 'page.tsx');

console.log('Fixing locale routing in board list page...');
console.log('File:', filePath);

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: handleWriteClick
content = content.replace(
  /router\.push\(`\/boards\/\$\{boardTypeId\}\/write`\)/g,
  'router.push(`/${currentLocale}/boards/${boardTypeId}/write`)'
);

// Fix 2: handleEditPost
content = content.replace(
  /router\.push\(`\/boards\/\$\{boardTypeId\}\/\$\{postId\}\/edit`\)/g,
  'router.push(`/${currentLocale}/boards/${boardTypeId}/${postId}/edit`)'
);

// Fix 3: Home button
content = content.replace(
  /onClick=\{\(\) => router\.push\('\/'\)\}/g,
  'onClick={() => router.push(`/${currentLocale}`)}'
);

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✓ Fixed handleWriteClick route');
console.log('✓ Fixed handleEditPost route');
console.log('✓ Fixed Home button route');
console.log('');
console.log('Locale routing fixes complete!');
