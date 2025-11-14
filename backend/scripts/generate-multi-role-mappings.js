const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const rolesPath = path.join(__dirname, '../data/roles.json');
const mappingsPath = path.join(__dirname, '../data/userRoleMappings.json');

// Read files
const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const rolesData = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
const roles = rolesData.roles || [];

console.log(`Found ${users.length} users`);
console.log(`Found ${roles.length} roles`);

// Strategy:
// - 70% of users have 1 role
// - 20% of users have 2 roles
// - 8% of users have 3 roles
// - 2% of users have 4+ roles

const userIds = users.map(u => u.id);
const mappings = [];
let mappingId = 1;

// Shuffle users
const shuffledUsers = [...userIds].sort(() => Math.random() - 0.5);

// Calculate distribution
const totalUsers = shuffledUsers.length;
const singleRoleCount = Math.floor(totalUsers * 0.70);
const twoRoleCount = Math.floor(totalUsers * 0.20);
const threeRoleCount = Math.floor(totalUsers * 0.08);
const multiRoleCount = totalUsers - singleRoleCount - twoRoleCount - threeRoleCount;

console.log(`\nDistribution plan:`);
console.log(`  Single role: ${singleRoleCount} users (70%)`);
console.log(`  Two roles: ${twoRoleCount} users (20%)`);
console.log(`  Three roles: ${threeRoleCount} users (8%)`);
console.log(`  4+ roles: ${multiRoleCount} users (2%)`);

let userIndex = 0;

// Assign 1 role
for (let i = 0; i < singleRoleCount; i++) {
  const userId = shuffledUsers[userIndex++];
  const role = roles[Math.floor(Math.random() * roles.length)];

  mappings.push(createMapping(mappingId++, userId, role.id));
}

// Assign 2 roles
for (let i = 0; i < twoRoleCount; i++) {
  const userId = shuffledUsers[userIndex++];
  const selectedRoles = getRandomRoles(roles, 2);

  selectedRoles.forEach(role => {
    mappings.push(createMapping(mappingId++, userId, role.id));
  });
}

// Assign 3 roles
for (let i = 0; i < threeRoleCount; i++) {
  const userId = shuffledUsers[userIndex++];
  const selectedRoles = getRandomRoles(roles, 3);

  selectedRoles.forEach(role => {
    mappings.push(createMapping(mappingId++, userId, role.id));
  });
}

// Assign 4+ roles
for (let i = 0; i < multiRoleCount; i++) {
  const userId = shuffledUsers[userIndex++];
  const roleCount = Math.floor(Math.random() * 3) + 4; // 4-6 roles
  const selectedRoles = getRandomRoles(roles, roleCount);

  selectedRoles.forEach(role => {
    mappings.push(createMapping(mappingId++, userId, role.id));
  });
}

console.log(`\nGenerated ${mappings.length} mappings`);

// Save to file
const data = {
  userRoleMappings: mappings
};

fs.writeFileSync(mappingsPath, JSON.stringify(data, null, 2), 'utf8');

console.log('Successfully updated userRoleMappings.json');
console.log(`Saved to: ${mappingsPath}`);

// Print stats
const activeCount = mappings.filter(m => m.isActive).length;
const inactiveCount = mappings.length - activeCount;
const withExpiration = mappings.filter(m => m.expiresAt !== null).length;

console.log('\nStatistics:');
console.log(`  Total mappings: ${mappings.length}`);
console.log(`  Active: ${activeCount}`);
console.log(`  Inactive: ${inactiveCount}`);
console.log(`  With expiration: ${withExpiration}`);

// Helper functions
function createMapping(id, userId, roleId) {
  const isActive = Math.random() > 0.1; // 90% active
  const hasExpiration = Math.random() < 0.2; // 20% have expiration

  return {
    id: `urm-${String(id).padStart(4, '0')}`,
    userId: userId,
    roleId: roleId,
    assignedBy: 'admin',
    assignedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: hasExpiration
      ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      : null,
    isActive: isActive
  };
}

function getRandomRoles(roles, count) {
  const shuffled = [...roles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, roles.length));
}
