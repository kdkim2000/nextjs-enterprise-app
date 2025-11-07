/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// Sample data pools
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
  'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy'
];

const departments = [
  'IT', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations',
  'Engineering', 'Support', 'Legal', 'Admin', 'Product', 'Design'
];

// const roles = ['user', 'manager', 'admin'];
// const statuses = ['active', 'inactive'];

// Weighted random selection for roles
function getRandomRole() {
  const rand = Math.random();
  if (rand < 0.80) return 'user';      // 80% users
  if (rand < 0.95) return 'manager';   // 15% managers
  return 'admin';                       // 5% admins
}

// Weighted random selection for status
function getRandomStatus() {
  return Math.random() < 0.90 ? 'active' : 'inactive'; // 90% active
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomLastLogin() {
  // 70% have logged in, 30% never logged in
  if (Math.random() < 0.30) return null;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return getRandomDate(thirtyDaysAgo, now).toISOString();
}

// Read existing users
const usersPath = path.join(__dirname, '..', 'backend', 'data', 'users.json');
const existingUsers = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

// Default password hash for "password123"
const defaultPasswordHash = '$2b$10$fgfsM0IoX778lfwSuOWbH.GsOTic.s0IkL7w7cZOhR87Y8Hqcphj6';

// Generate users to reach 30000 total
const targetTotal = 30000;
const usersToGenerate = targetTotal - existingUsers.length;
console.log(`📝 Generating ${usersToGenerate} users to reach ${targetTotal} total...`);

const newUsers = [];
const usedUsernames = new Set(existingUsers.map(u => u.username));
const startId = existingUsers.length + 1;

for (let i = 0; i < usersToGenerate; i++) {
  if ((i + 1) % 1000 === 0) {
    console.log(`   Progress: ${i + 1}/${usersToGenerate} users generated...`);
  }
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  // Generate unique username
  let username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  let suffix = 1;
  while (usedUsernames.has(username)) {
    username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}`;
    suffix++;
  }
  usedUsernames.add(username);

  const user = {
    id: `user-${String(startId + i).padStart(5, '0')}`,
    username: username,
    password: defaultPasswordHash,
    email: `${username}@example.com`,
    name: `${firstName} ${lastName}`,
    role: getRandomRole(),
    department: departments[Math.floor(Math.random() * departments.length)],
    mfaEnabled: Math.random() < 0.3, // 30% have MFA enabled
    ssoEnabled: Math.random() < 0.4,  // 40% have SSO enabled
    status: getRandomStatus(),
    createdAt: getRandomDate(new Date('2024-01-01'), new Date('2024-12-31')).toISOString(),
    lastLogin: getRandomLastLogin()
  };

  newUsers.push(user);
}

console.log(`✨ User generation complete!`);

// Combine existing and new users
const allUsers = [...existingUsers, ...newUsers];

// Write back to file
fs.writeFileSync(usersPath, JSON.stringify(allUsers, null, 2), 'utf-8');

console.log(`✅ Successfully added ${newUsers.length} users!`);
console.log(`📊 Total users: ${allUsers.length}`);
console.log(`\n👤 Role distribution:`);
const roleCounts = allUsers.reduce((acc, u) => {
  acc[u.role] = (acc[u.role] || 0) + 1;
  return acc;
}, {});
console.log(`   - Admin: ${roleCounts.admin || 0}`);
console.log(`   - Manager: ${roleCounts.manager || 0}`);
console.log(`   - User: ${roleCounts.user || 0}`);

console.log(`\n📍 Status distribution:`);
const statusCounts = allUsers.reduce((acc, u) => {
  acc[u.status] = (acc[u.status] || 0) + 1;
  return acc;
}, {});
console.log(`   - Active: ${statusCounts.active || 0}`);
console.log(`   - Inactive: ${statusCounts.inactive || 0}`);

console.log(`\n🏢 Department distribution:`);
const deptCounts = allUsers.reduce((acc, u) => {
  acc[u.department] = (acc[u.department] || 0) + 1;
  return acc;
}, {});
Object.keys(deptCounts).sort().forEach(dept => {
  console.log(`   - ${dept}: ${deptCounts[dept]}`);
});
