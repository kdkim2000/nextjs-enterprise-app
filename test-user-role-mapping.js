const db = require('./backend/config/database');
const mappingService = require('./backend/services/mappingService');

async function testUserRoleMapping() {
  try {
    console.log('Testing user-role-mapping service...\n');

    // Get a sample user ID from the database
    const userResult = await db.query('SELECT id FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      console.log('No users found in database');
      await db.closePool();
      process.exit(1);
    }

    const userId = userResult.rows[0].id;
    console.log('Testing with user ID:', userId);

    // Test getUserRoleMappingsByUserId without details
    console.log('\n1. Testing getUserRoleMappingsByUserId (without details)...');
    const mappingsBasic = await mappingService.getUserRoleMappingsByUserId(userId, false);
    console.log('   ✓ Found', mappingsBasic.length, 'mappings');
    if (mappingsBasic.length > 0) {
      console.log('   First mapping (basic):', {
        id: mappingsBasic[0].id,
        user_id: mappingsBasic[0].user_id,
        role_id: mappingsBasic[0].role_id
      });
    }

    // Test getUserRoleMappingsByUserId with details
    console.log('\n2. Testing getUserRoleMappingsByUserId (with details)...');
    const mappingsDetailed = await mappingService.getUserRoleMappingsByUserId(userId, true);
    console.log('   ✓ Found', mappingsDetailed.length, 'mappings with details');
    if (mappingsDetailed.length > 0) {
      console.log('   First mapping (detailed):', {
        id: mappingsDetailed[0].id,
        user_id: mappingsDetailed[0].user_id,
        role_id: mappingsDetailed[0].role_id,
        username: mappingsDetailed[0].username,
        email: mappingsDetailed[0].email,
        user_name: mappingsDetailed[0].user_name,
        user_department: mappingsDetailed[0].user_department,
        role_name: mappingsDetailed[0].role_name,
        role_display_name: mappingsDetailed[0].role_display_name
      });
    }

    console.log('\n✓ User-role-mapping service is working correctly!');

    await db.closePool();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await db.closePool();
    process.exit(1);
  }
}

testUserRoleMapping();
