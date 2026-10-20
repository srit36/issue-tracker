// BEFORE-screenshot helper: stores a demo user the insecure way (plain text)
// in a separate collection so you can screenshot it in Atlas. Run once:
//   node scripts/demo-plaintext.js
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.collection('users_before_hashing').insertOne({
    username: 'alice',
    email: 'alice@example.com',
    password: 'Passw0rd!123',   // <-- plain text: this is what we are fixing
    role: 'reporter'
  });
  console.log('Inserted plain-text demo user into users_before_hashing');
  await mongoose.disconnect();
})();
