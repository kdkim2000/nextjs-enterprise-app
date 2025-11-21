const bcrypt = require('bcrypt');

const password = 'admin123';
const hash = '$2b$10$JlyNjyv9Fq2z1EFVgUWCfu3micETTYFDkq.gnDqFvJdoSWVRVx6dG';

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error verifying password:', err);
    process.exit(1);
  }

  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('Match:', result ? '✓ YES' : '✗ NO');

  if (result) {
    console.log('\n✅ Admin password verification successful!');
    console.log('Login ID: admin');
    console.log('Password: admin123');
  } else {
    console.log('\n❌ Password verification failed!');
  }

  process.exit(result ? 0 : 1);
});
