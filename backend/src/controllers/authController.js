const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { generateToken } = require('../utils/token');
const { validateCollegeDomain } = require('../utils/domainValidator');
const { parseCollegeEmail } = require('../utils/studentIdParser');
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

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@knit.ac.in')) {
      return next(
        new AppError('Access restricted: Only official institute student Google accounts are permitted to sign in.', 403)
      );
    }

    const college = await validateCollegeDomain(cleanEmail);
    const parsed = parseCollegeEmail(cleanEmail);

    // Official college emails (e.g. mukul.24636@knit.ac.in) have immutable names derived directly from student ID
    const adminEmails = (process.env.ADMIN_EMAILS || 'mukul.24636@knit.ac.in,admin@knit.ac.in')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isUserAdmin = cleanEmail.startsWith('admin') || adminEmails.includes(cleanEmail);
    const userRole = isUserAdmin ? 'admin' : 'student';

    let user = await User.findOne({ email: cleanEmail }).populate('collegeId', 'name code');

    if (!user) {
      user = await User.create({
        name: studentName,
        email: cleanEmail,
        studentId: parsed.studentId,
        rollNumber: parsed.rollNumber,
        avatar: picture || '',
        googleId,
        collegeId: college._id,
        branch: '',
        semester: null,
        hasCompletedOnboarding: false,
        role: userRole,
        isVerified: true
      });
      user = await User.findById(user._id).populate('collegeId', 'name code');
    } else {
      let needsSave = false;
      if (isUserAdmin && user.role !== 'admin') {
        user.role = 'admin';
        needsSave = true;
      } else if (!isUserAdmin && user.role === 'admin' && !cleanEmail.startsWith('admin')) {
        user.role = 'student';
        needsSave = true;
      }
      // Enforce the derived name if from college domain
      if (parsed.isValidCollegeEmail && parsed.name && user.name !== parsed.name) {
        user.name = parsed.name;
        needsSave = true;
      }
      if (parsed.rollNumber && !user.rollNumber) {
        user.rollNumber = parsed.rollNumber;
        user.studentId = parsed.studentId;
        needsSave = true;
      }
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

    const { email } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return next(new AppError('Email is required for login.', 400));
    }

    const college = await validateCollegeDomain(cleanEmail);
    const parsed = parseCollegeEmail(cleanEmail);

    // Derive name strictly from email (e.g. mukul.24636@knit.ac.in -> Mukul), student cannot modify
    const studentName = parsed.name || 'KNIT Student';
    const userRole = cleanEmail.startsWith('admin') ? 'admin' : 'student';

    let user = await User.findOne({ email: cleanEmail }).populate('collegeId', 'name code');

    if (!user) {
      user = await User.create({
        name: studentName,
        email: cleanEmail,
        studentId: parsed.studentId,
        rollNumber: parsed.rollNumber,
        collegeId: college._id,
        branch: '',
        semester: null,
        hasCompletedOnboarding: false,
        role: userRole,
        isVerified: true
      });
      user = await User.findById(user._id).populate('collegeId', 'name code');
    } else {
      if (cleanEmail.startsWith('admin') && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
      // Sync official name and roll number if modified or missing
      if (parsed.name && user.name !== parsed.name) {
        user.name = parsed.name;
        user.rollNumber = parsed.rollNumber;
        user.studentId = parsed.studentId;
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
