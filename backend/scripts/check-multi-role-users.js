const fs = require('fs');
const path = require('path');

const mappingsPath = path.join(__dirname, '../data/userRoleMappings.json');
const data = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'));

const userMap = {};
data.userRoleMappings.forEach(m => {
  if (m.isActive) {
    if (!userMap[m.userId]) userMap[m.userId] = [];
    userMap[m.userId].push(m.roleId);
  }
});

const multiRoleUsers = Object.entries(userMap).filter(([, roles]) => roles.length > 1);
const singleRoleUsers = Object.entries(userMap).filter(([, roles]) => roles.length === 1);

console.log(`Total active users in mappings: ${Object.keys(userMap).length}`);
console.log(`Users with single role: ${singleRoleUsers.length}`);
console.log(`Users with multiple roles: ${multiRoleUsers.length}`);

if (multiRoleUsers.length > 0) {
  console.log('\nSample users with multiple roles:');
  multiRoleUsers.slice(0, 5).forEach(([userId, roles]) => {
    console.log(`  ${userId}: ${roles.length} roles - ${roles.join(', ')}`);
  });
} else {
  console.log('\n⚠️  No users have multiple roles yet!');
}
