const bcrypt = require('bcrypt');

const password = '<TEST_PASSWORD>';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('Password:', password);
  console.log('Hash:', hash);
  process.exit(0);
});
