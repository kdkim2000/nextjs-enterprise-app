const db = require('./backend/config/database');
const userService = require('./backend/services/userService');

async function testUserService() {
  try {
    console.log('Testing user service...\n');

    // Test getAllUsers without search
    console.log('1. Testing getAllUsers (without search)...');
    const allUsers = await userService.getAllUsers({ limit: 5 });
    console.log(`   ✓ Found ${allUsers.length} users`);
    if (allUsers.length > 0) {
      console.log('   First user:', {
        id: allUsers[0].id,
        username: allUsers[0].username,
        name: allUsers[0].name,
        email: allUsers[0].email
      });
    }

    // Test getAllUsers with search
    console.log('\n2. Testing getAllUsers (with search)...');
    const searchResults = await userService.getAllUsers({ search: 'gary', limit: 5 });
    console.log(`   ✓ Found ${searchResults.length} users matching "gary"`);
    if (searchResults.length > 0) {
      console.log('   First result:', {
        username: searchResults[0].username,
        name: searchResults[0].name,
        email: searchResults[0].email
      });
    }

    // Test getUserCount without search
    console.log('\n3. Testing getUserCount (without search)...');
    const totalCount = await userService.getUserCount();
    console.log(`   ✓ Total user count: ${totalCount}`);

    // Test getUserCount with search
    console.log('\n4. Testing getUserCount (with search)...');
    const searchCount = await userService.getUserCount({ search: 'gary' });
    console.log(`   ✓ User count matching "gary": ${searchCount}`);

    console.log('\n✓ User service is working correctly!');

    await db.closePool();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await db.closePool();
    process.exit(1);
  }
}

testUserService();
