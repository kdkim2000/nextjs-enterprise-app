const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testMessage() {
  try {
    console.log('Testing /message/code/:code endpoint...\n');

    // First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'john.doe',
      password: 'Password123!'
    });

    const { token } = loginResponse.data;
    console.log('✓ Login successful');
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('');

    // Check if there are any messages in the database
    console.log('2. Checking for messages in database...');
    const messagesResponse = await axios.get(`${API_BASE_URL}/message`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Messages count:', messagesResponse.data.messages?.length || 0);
    if (messagesResponse.data.messages?.length > 0) {
      console.log('First message code:', messagesResponse.data.messages[0].code);
      console.log('');

      // Test getting message by code
      const testCode = messagesResponse.data.messages[0].code;
      console.log(`3. Testing /message/code/${testCode}`);
      try {
        const messageResponse = await axios.get(`${API_BASE_URL}/message/code/${testCode}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✓ Request successful');
        console.log('Message:', messageResponse.data);
      } catch (error) {
        console.log('✗ Request failed');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data);
      }
    } else {
      console.log('No messages found in database');
      console.log('Testing with a non-existent code...');

      try {
        const messageResponse = await axios.get(`${API_BASE_URL}/message/code/TEST-001`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✓ Request successful');
        console.log('Message:', messageResponse.data);
      } catch (error) {
        console.log('✓ Request handled correctly');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data);
      }
    }

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testMessage();
