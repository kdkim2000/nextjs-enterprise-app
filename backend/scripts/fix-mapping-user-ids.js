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

// Extract user IDs
const userIds = users.map(u => u.id);

// Generate new mappings with valid user IDs
const mappings = [];
let mappingId = 1;

roles.forEach(role => {
  // Each role gets 5-30 random users
  const userCount = Math.floor(Math.random() * 26) + 5;

  // Shuffle and pick random users
  const shuffled = [...userIds].sort(() => Math.random() - 0.5);
  const selectedUsers = shuffled.slice(0, Math.min(userCount, userIds.length));

  selectedUsers.forEach(userId => {
    const isActive = Math.random() > 0.1; // 90% active
    const hasExpiration = Math.random() < 0.2; // 20% have expiration

    const mapping = {
      id: `urm-${String(mappingId).padStart(3, '0')}`,
      userId: userId,
      roleId: role.id,
      assignedBy: 'admin',
      assignedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: hasExpiration
        ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
        : null,
      isActive: isActive
    };

    mappings.push(mapping);
    mappingId++;
  });
});

console.log(`Generated ${mappings.length} mappings`);

// Save to file
const data = {
  userRoleMappings: mappings
};

fs.writeFileSync(mappingsPath, JSON.stringify(data, null, 2), 'utf8');

console.log('Successfully updated userRoleMappings.json with valid user IDs');
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
