const db = require('./backend/config/database');
const messageService = require('./backend/services/messageService');

async function testMessageTransform() {
  try {
    console.log('Testing message service transformation...\n');

    // Test getAllMessages
    const messages = await messageService.getAllMessages();
    console.log('✓ getAllMessages() returned:', messages.length, 'messages');

    if (messages.length > 0) {
      const firstMessage = messages[0];
      console.log('\nFirst message structure:');
      console.log('  ID:', firstMessage.id);
      console.log('  Code:', firstMessage.code);
      console.log('  Message object:', JSON.stringify(firstMessage.message, null, 2));
      console.log('  Description object:', JSON.stringify(firstMessage.description, null, 2));

      // Verify the structure
      if (firstMessage.message &&
          typeof firstMessage.message === 'object' &&
          'en' in firstMessage.message &&
          'ko' in firstMessage.message) {
        console.log('\n✓ Message transformation is correct!');
      } else {
        console.log('\n✗ Message transformation is INCORRECT!');
        console.log('  Expected message to be an object with en, ko, zh, vi properties');
      }
    }

    await db.closePool();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await db.closePool();
    process.exit(1);
  }
}

testMessageTransform();
