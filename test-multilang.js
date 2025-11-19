const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testMultilangEndpoints() {
  try {
    console.log('Testing Multi-language Endpoints...\n');

    // Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'john.doe',
      password: 'Password123!'
    });

    const { token } = loginResponse.data;
    console.log('✓ Login successful\n');

    const headers = { Authorization: `Bearer ${token}` };

    // Test endpoints
    const tests = [
      { name: 'Message', url: '/message/code/COMMON_SAVE_SUCCESS', fields: ['message', 'description'] },
      { name: 'Menu', url: '/menu/user-menus', fields: ['name', 'description'], isArray: true },
      { name: 'Program', url: '/program', fields: ['name', 'description'], isArray: true },
      { name: 'Department', url: '/department', fields: ['name', 'description'], isArray: true },
      { name: 'Code', url: '/code?limit=5', fields: ['name', 'description'], isArray: true }
    ];

    for (const test of tests) {
      console.log(`Testing ${test.name}...`);
      try {
        const response = await axios.get(`${API_BASE_URL}${test.url}`, { headers });

        let data = response.data;
        if (test.isArray) {
          // Get first item from array
          const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
          if (!arrayKey || data[arrayKey].length === 0) {
            console.log(`  ⚠ No data found for ${test.name}`);
            continue;
          }
          data = data[arrayKey][0];
        }

        // Check multilingual fields
        let allFieldsOk = true;
        for (const field of test.fields) {
          if (!data[field] || typeof data[field] !== 'object') {
            console.log(`  ✗ ${field} is not an object`);
            allFieldsOk = false;
          } else if (!data[field].en && !data[field].ko) {
            console.log(`  ✗ ${field} missing language fields`);
            allFieldsOk = false;
          }
        }

        if (allFieldsOk) {
          console.log(`  ✓ All multilingual fields properly structured`);
          // Show example
          const firstField = test.fields[0];
          if (data[firstField]) {
            console.log(`    Example ${firstField}.en: "${data[firstField].en?.substring(0, 50)}${data[firstField].en?.length > 50 ? '...' : ''}"`);
            console.log(`    Example ${firstField}.ko: "${data[firstField].ko?.substring(0, 50)}${data[firstField].ko?.length > 50 ? '...' : ''}"`);
          }
        }
      } catch (error) {
        console.log(`  ✗ Request failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      }
      console.log('');
    }

    console.log('✓ All tests completed!');

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testMultilangEndpoints();
