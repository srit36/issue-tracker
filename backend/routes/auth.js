const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/crypto');
const { issueToken, authenticate, requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const BCRYPT_ROUNDS = 12;
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

authenticator.options = { window: 1 }; // accept +/- 30 s clock drift

// Brute-force protection (per instance; see notes about 3 backends)
const limiter = (max) => rateLimit({
  windowMs: 15 * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, try again in 15 minutes' }
});
const loginLimiter = limiter(10);
const mfaLimiter = limiter(10);

const isStr = (v) => typeof v === 'string';

// POST /auth/register  -> first user becomes admin, everyone else is a reporter
router.post('/register', loginLimiter, async (req, res) => {
  const { username, email, password } = req.body || {};
  if (![username, email, password].every(isStr)) {
    return res.status(400).json({ error: 'username, email and password are required' });
  }
  if (password.length < 10 || password.length > 72) {
    return res.status(400).json({ error: 'Password must be 10-72 characters' });
  }
  try {
    const role = (await User.countDocuments()) === 0 ? 'admin' : 'reporter';
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ username, email, passwordHash, role });
    res.status(201).json({ message: 'Registered', username: user.username, role: user.role });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Username or email already in use' });
    res.status(400).json({ error: err.message });
  }
});

// POST /auth/login  (step 1: password)
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (!isStr(username) || !isStr(password)) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  const user = await User.findOne({ username: username.trim().toLowerCase() });
  // Always run a bcrypt compare so response time doesn't reveal valid usernames
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) return res.status(401).json({ error: 'Invalid username or password' });

  if (!user.totpEnabled) {
    return res.json({ step: 'mfa-setup', tempToken: issueToken(user, 'mfa-setup', '10m') });
  }
  res.json({ step: 'mfa-verify', tempToken: issueToken(user, 'mfa', '5m') });
});

// POST /auth/mfa/setup  (first login only: returns QR code for the authenticator app)
router.post('/mfa/setup', authenticate('mfa-setup'), async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.totpEnabled) return res.status(400).json({ error: 'MFA is already enabled' });

  const secret = authenticator.generateSecret();
  user.totpSecretEnc = encrypt(secret);
  await user.save();

  const otpauthUrl = authenticator.keyuri(user.username, 'IssueTracker', secret);
  const qrCode = await QRCode.toDataURL(otpauthUrl);
  res.json({ qrCode, secret });
});

// POST /auth/mfa/enable  { code }  (confirm enrolment, returns the access token)
router.post('/mfa/enable', mfaLimiter, authenticate('mfa-setup'), async (req, res) => {
  const { code } = req.body || {};
  const user = await User.findById(req.user.id);
  if (!isStr(code) || !user.totpSecretEnc || user.totpEnabled) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  if (!authenticator.check(code.trim(), decrypt(user.totpSecretEnc))) {
    return res.status(401).json({ error: 'Invalid authenticator code' });
  }
  user.totpEnabled = true;
  await user.save();
  res.json({ token: issueToken(user, 'access', '1h'), username: user.username, role: user.role });
});

// POST /auth/mfa/verify  { code }  (step 2 of every later login)
router.post('/mfa/verify', mfaLimiter, authenticate('mfa'), async (req, res) => {
  const { code } = req.body || {};
  const user = await User.findById(req.user.id);
  if (!isStr(code) || !user.totpEnabled) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  if (!authenticator.check(code.trim(), decrypt(user.totpSecretEnc))) {
    return res.status(401).json({ error: 'Invalid authenticator code' });
  }
  res.json({ token: issueToken(user, 'access', '1h'), username: user.username, role: user.role });
});

// GET /auth/me
router.get('/me', requireAuth, (req, res) => res.json(req.user));

// PUT /auth/users/:id/role  { role }   (admin only)
router.put('/users/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  const { role } = req.body || {};
  if (!['admin', 'developer', 'reporter'].includes(role)) {
    return res.status(400).json({ error: 'role must be admin, developer or reporter' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { returnDocument: 'after' });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ username: user.username, role: user.role });
});

module.exports = router;
