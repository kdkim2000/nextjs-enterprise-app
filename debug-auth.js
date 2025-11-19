// Debug script to test authentication
const axios = require('axios');

async function testAuth() {
  console.log('=== Authentication Debug Tool ===\n');

  const API_BASE_URL = 'http://localhost:3001/api';

  // Test 1: Login
  console.log('Test 1: Testing login endpoint...');
  try {
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    console.log('✓ Login successful');
    console.log('  User:', loginResponse.data.user?.username);
    console.log('  Token received:', loginResponse.data.token ? 'YES' : 'NO');
    console.log('  Refresh token received:', loginResponse.data.refreshToken ? 'YES' : 'NO');

    const token = loginResponse.data.token;

    // Test 2: Verify token with protected endpoint
    console.log('\nTest 2: Testing protected endpoint (user-menus)...');
    try {
      const menusResponse = await axios.get(`${API_BASE_URL}/menu/user-menus`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✓ Protected endpoint accessible');
      console.log('  Menus received:', menusResponse.data.menus?.length || 0);
    } catch (menuError) {
      console.log('✗ Protected endpoint failed');
      console.log('  Status:', menuError.response?.status);
      console.log('  Error:', menuError.response?.data?.error);
      console.log('  Message:', menuError.message);
    }

    // Test 3: Test token verification
    console.log('\nTest 3: Testing token format...');
    const tokenParts = token.split('.');
    console.log('  Token has 3 parts:', tokenParts.length === 3 ? 'YES' : 'NO');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('  Token payload:', JSON.stringify(payload, null, 2));
        console.log('  Token expires:', new Date(payload.exp * 1000).toISOString());
        console.log('  Token expired:', Date.now() > payload.exp * 1000 ? 'YES' : 'NO');
      } catch (e) {
        console.log('  Failed to decode token payload');
      }
    }

  } catch (loginError) {
    console.log('✗ Login failed');
    console.log('  Status:', loginError.response?.status);
    console.log('  Error:', loginError.response?.data?.error);
    console.log('  Message:', loginError.message);
    console.log('\nBackend server might not be running or credentials are incorrect');
  }
}

testAuth().then(() => {
  console.log('\n=== Debug Complete ===');
  process.exit(0);
}).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
