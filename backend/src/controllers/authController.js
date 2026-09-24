const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { generateToken } = require('../utils/token');
const { validateCollegeDomain } = require('../utils/domainValidator');
const { sendResponse } = require('../utils/apiResponse');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return next(new AppError('Google authentication credential is required.', 400));
    }

    let email, name, picture, googleId;

    if (process.env.GOOGLE_CLIENT_ID) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      googleId = payload.sub;
    } else {
      // In development when GOOGLE_CLIENT_ID is not yet configured, decode JWT payload
      const base64Url = credential.split('.')[1];
      if (!base64Url) {
        return next(new AppError('Invalid Google credential format.', 400));
      }
      const decodedPayload = JSON.parse(Buffer.from(base64Url, 'base64').toString());
      email = decodedPayload.email;
      name = decodedPayload.name;
      picture = decodedPayload.picture;
      googleId = decodedPayload.sub;
    }

    if (!email) {
      return next(new AppError('Could not retrieve email from Google account.', 400));
    }

    const college = await validateCollegeDomain(email);

    let user = await User.findOne({ email }).populate('collegeId', 'name code');

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture || '',
        googleId,
        collegeId: college._id,
        isVerified: true
      });
      user = await User.findById(user._id).populate('collegeId', 'name code');
    } else {
      let needsSave = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    const token = generateToken({ id: user._id, role: user.role });

    return sendResponse(res, {
      statusCode: 200,
      message: 'Login successful',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

const devLogin = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return next(new AppError('Development login is disabled in production.', 403));
    }

    const { email, name = 'KNIT Student' } = req.body;

    if (!email) {
      return next(new AppError('Email is required for dev login.', 400));
    }

    const college = await validateCollegeDomain(email);

    let user = await User.findOne({ email }).populate('collegeId', 'name code');

    if (!user) {
      user = await User.create({
        name,
        email,
        collegeId: college._id,
        branch: 'Information Technology',
        semester: 6,
        isVerified: true
      });
      user = await User.findById(user._id).populate('collegeId', 'name code');
    }

    const token = generateToken({ id: user._id, role: user.role });

    return sendResponse(res, {
      statusCode: 200,
      message: 'Development login successful',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    return sendResponse(res, {
      statusCode: 200,
      message: 'Current user profile retrieved',
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  googleLogin,
  devLogin,
  getMe
};
