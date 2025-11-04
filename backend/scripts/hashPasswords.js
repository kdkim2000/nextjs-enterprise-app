const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

const SALT_ROUNDS = 10;
const USERS_FILE = path.join(__dirname, '../data/users.json');

async function hashPasswords() {
  try {
    console.log('Reading users file...');
    const usersData = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(usersData);

    console.log(`Found ${users.length} users. Hashing passwords...`);

    // Hash passwords for each user
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2b$)
      if (!user.password.startsWith('$2b$')) {
        console.log(`Hashing password for user: ${user.username}`);
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
        user.password = hashedPassword;
        console.log(`  Original: (hidden for security)`);
        console.log(`  Hashed: ${hashedPassword}`);
      } else {
        console.log(`Password for ${user.username} is already hashed, skipping...`);
      }
    }

    // Write updated users back to file
    console.log('\nWriting updated users to file...');
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');

    console.log('✅ All passwords have been hashed successfully!');
    console.log('\n📝 Demo account credentials (for reference):');
    console.log('  Admin: admin / admin123');
    console.log('  User: john.doe / password123');
    console.log('  Manager: jane.smith / password123');

  } catch (error) {
    console.error('Error hashing passwords:', error);
    process.exit(1);
  }
}

// Run the script
hashPasswords();
