const jwt = require('jsonwebtoken');
const User = require('../models/User');

// scope separates the short-lived MFA tokens from the real access token:
//   'mfa-setup'  -> issued after password OK, user has not enrolled TOTP yet
//   'mfa'        -> issued after password OK, user must submit a TOTP code
//   'access'     -> issued only after password AND TOTP are verified
function issueToken(user, scope, expiresIn) {
  return jwt.sign(
    { sub: user.id, role: user.role, scope },
    process.env.JWT_SECRET,
    { expiresIn, algorithm: 'HS256' }
  );
}

function authenticate(scope) {
  return async (req, res, next) => {
    const [type, token] = (req.headers.authorization || '').split(' ');
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Authentication required: missing token' });
    }
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    if (payload.scope !== scope) {
      return res.status(401).json({ error: 'Invalid token for this operation' });
    }
    // Look the user up so deleted users / changed roles take effect immediately
    const user = await User.findById(payload.sub).select('role');
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    req.user = { id: user.id, role: user.role };
    next();
  };
}

const requireAuth = authenticate('access');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: requires role ${roles.join(' or ')}, you are '${req.user.role}'`
      });
    }
    next();
  };
}

module.exports = { issueToken, authenticate, requireAuth, requireRole };
