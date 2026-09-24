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

  let college = await College.findOne({
    allowedDomains: domain,
    isActive: true
  });

  if (!college) {
    // In development mode, allow testers using Gmail to bind to KNIT Sultanpur
    if (process.env.NODE_ENV !== 'production') {
      college = await College.findOne({ code: 'KNIT', isActive: true });
    }

    if (!college) {
      throw new AppError(
        `Access restricted: Only verified college email addresses (e.g. @knit.ac.in) are permitted to sign in`,
        403
      );
    }
  }

  return college;
};

module.exports = {
  extractEmailDomain,
  validateCollegeDomain
};
