const User = require('../models/User');
const College = require('../models/College');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/apiResponse');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('collegeId', 'name code branches allowedDomains')
      .lean();

    if (!user) {
      return next(new AppError('User profile not found.', 404));
    }

    return sendResponse(res, {
      statusCode: 200,
      message: 'Student profile retrieved successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { branch, semester, graduationYear, avatar } = req.body;

    const updates = {};

    if (semester !== undefined) {
      const semNum = Number(semester);
      if (isNaN(semNum) || semNum < 1 || semNum > 8) {
        return next(new AppError('Semester must be an integer between 1 and 8.', 400));
      }
      updates.semester = semNum;
    }

    if (graduationYear !== undefined) {
      const gradYear = Number(graduationYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(gradYear) || gradYear < currentYear - 6 || gradYear > currentYear + 6) {
        return next(new AppError(`Graduation year must be between ${currentYear - 6} and ${currentYear + 6}.`, 400));
      }
      updates.graduationYear = gradYear;
    }

    if (branch !== undefined) {
      updates.branch = String(branch).trim();
    }

    if (avatar !== undefined) {
      updates.avatar = String(avatar).trim();
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('collegeId', 'name code branches');

    return sendResponse(res, {
      statusCode: 200,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
