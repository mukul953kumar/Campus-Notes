const College = require('../models/College');
const AppError = require('./appError');

const extractEmailDomain = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return null;
  }
  return email.split('@').pop().toLowerCase().trim();
};

const validateCollegeDomain = async (email) => {
  const domain = extractEmailDomain(email);

  if (!domain) {
    throw new AppError('Please provide a valid college email address', 400);
  }

  const college = await College.findOne({
    allowedDomains: domain,
    isActive: true
  });

  if (!college) {
    throw new AppError(
      'Access restricted: Only verified institute student email addresses are permitted to sign in',
      403
    );
  }

  return college;
};

module.exports = {
  extractEmailDomain,
  validateCollegeDomain
};
