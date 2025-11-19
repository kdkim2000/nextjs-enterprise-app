/**
 * Automatic Route Conversion Script
 * Converts JSON-based routes to PostgreSQL-based routes
 */

const fs = require('fs');
const path = require('path');

// Files to convert with their service mappings
const conversions = [
  { file: 'help.js', service: 'helpService', oldImport: '../utils/fileUtils', dataFile: 'HELP_FILE' },
  { file: 'message.js', service: 'messageService', oldImport: '../utils/fileUtils', dataFile: 'MESSAGES_FILE' },
  { file: 'code.js', service: 'codeService', oldImport: '../utils/fileUtils', dataFile: 'CODES_FILE' },
  { file: 'codeType.js', service: 'codeService', oldImport: '../utils/fileUtils', dataFile: 'CODE_TYPES_FILE' },
  { file: 'userSettings.js', service: 'preferencesService', oldImport: '../utils/fileUtils', dataFile: 'USER_SETTINGS_FILE' },
];

function convertFile(fileName, serviceName, oldImport, dataFileConst) {
  const filePath = path.join(__dirname, 'routes', fileName);
  const backupPath = filePath + '.backup';

  console.log(`\nConverting ${fileName}...`);

  try {
    // Read file
    let content = fs.readFileSync(filePath, 'utf8');

    // Backup if not exists
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content);
      console.log(`  ✓ Backup created`);
    }

    // Remove old imports
    content = content.replace(/const \{ readJSON, writeJSON \} = require\(['"]\.\.\/utils\/fileUtils['"]\);?\n?/g, '');
    content = content.replace(/const path = require\(['"]path['"]\);?\n?/g, '');

    // Remove data file constants
    const dataFilePattern = new RegExp(`const ${dataFileConst} = path\\.join\\(__dirname, [^;]+;?\\n?`, 'g');
    content = content.replace(dataFilePattern, '');

    // Add service import after express
    const serviceImport = `const ${serviceName} = require('../services/${serviceName}');\n`;
    if (!content.includes(serviceImport.trim())) {
      content = content.replace(
        /(const express = require\(['"]express['"]\);)/,
        `$1\n${serviceImport}`
      );
    }

    // Add uuid if needed and not present
    if (!content.includes("require('uuid')")) {
      content = content.replace(
        /(const express = require\(['"]express['"]\);)/,
        `$1\nconst { v4: uuidv4 } = require('uuid');`
      );
    }

    console.log(`  ✓ Imports updated`);
    console.log(`  ⚠ Manual conversion of readJSON/writeJSON calls still needed`);
    console.log(`  → Use ${serviceName} methods instead`);

    // Write updated file
    fs.writeFileSync(filePath, content);

    return true;
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return false;
  }
}

console.log('='.repeat(70));
console.log('Automatic Route Conversion to PostgreSQL');
console.log('='.repeat(70));

let successCount = 0;
let failCount = 0;

conversions.forEach(({ file, service, oldImport, dataFile }) => {
  if (convertFile(file, service, oldImport, dataFile)) {
    successCount++;
  } else {
    failCount++;
  }
});

console.log('\n' + '='.repeat(70));
console.log(`Summary: ${successCount} converted, ${failCount} failed`);
console.log('='.repeat(70));
console.log('\nNote: Files have been partially converted (imports updated).');
console.log('Manual conversion of readJSON/writeJSON calls is still required.');
console.log('See CONVERSION-GUIDE-COMPLETE.md for patterns.\n');
