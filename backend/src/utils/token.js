const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'campus_notes_dev_secret_key_change_in_production_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'campus_notes_dev_secret_key_change_in_production_2026';
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken
};
