const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/userRoleMappings.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const mappings = data.userRoleMappings || [];

console.log(`Original mappings count: ${mappings.length}`);

// Take only first 200 mappings for testing
const reducedMappings = mappings.slice(0, 200);

console.log(`Reduced mappings count: ${reducedMappings.length}`);

const newData = {
  ...data,
  userRoleMappings: reducedMappings
};

fs.writeFileSync(dataPath, JSON.stringify(newData, null, 2), 'utf8');

console.log('Successfully reduced userRoleMappings.json');
console.log(`Saved to: ${dataPath}`);
