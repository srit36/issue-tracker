const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true,
    trim: true, lowercase: true, minlength: 3, maxlength: 32
  },
  email: {
    type: String, required: true, unique: true,
    trim: true, lowercase: true, maxlength: 254
  },
  // bcrypt hash (salt is embedded in the hash string). Never the plain password.
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'developer', 'reporter'],
    default: 'reporter'
  },
  // TOTP secret, AES-256-GCM encrypted (see utils/crypto.js)
  totpSecretEnc: { type: String, default: null },
  totpEnabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
