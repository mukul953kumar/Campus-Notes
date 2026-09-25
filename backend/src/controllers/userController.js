const User = require('../models/User');
const Resource = require('../models/Resource');
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

const getLeaderboard = async (req, res, next) => {
  try {
    const { branch, sortBy = 'uploads', limit = 25 } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 25));

    const matchStage = {
      verificationStatus: 'verified',
      isActive: true
    };

    if (branch) {
      matchStage.branch = branch;
    }

    const aggregatePipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$uploaderId',
          verifiedUploads: { $sum: 1 },
          totalDownloads: { $sum: '$downloadsCount' },
          averageRating: { $avg: '$averageRating' },
          totalRatingsCount: { $sum: '$ratingsCount' },
          subjectsCovered: { $addToSet: '$subjectId' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $match: {
          'user.isActive': true
        }
      },
      {
        $project: {
          _id: 1,
          verifiedUploads: 1,
          totalDownloads: 1,
          averageRating: { $round: [{ $ifNull: ['$averageRating', 0] }, 1] },
          totalRatingsCount: 1,
          subjectsCount: { $size: '$subjectsCovered' },
          user: {
            _id: '$user._id',
            name: '$user.name',
            avatar: '$user.avatar',
            branch: '$user.branch',
            semester: '$user.semester',
            role: '$user.role',
            graduationYear: '$user.graduationYear'
          }
        }
      }
    ];

    let sortStage = { verifiedUploads: -1, totalDownloads: -1, averageRating: -1 };
    if (sortBy === 'downloads') {
      sortStage = { totalDownloads: -1, verifiedUploads: -1, averageRating: -1 };
    } else if (sortBy === 'rating') {
      sortStage = { averageRating: -1, totalRatingsCount: -1, verifiedUploads: -1 };
    }

    aggregatePipeline.push({ $sort: sortStage });
    aggregatePipeline.push({ $limit: limitNum });

    const contributors = await Resource.aggregate(aggregatePipeline);

    const rankedContributors = contributors.map((item, index) => {
      const rank = index + 1;
      let badge = 'Note Sharer';
      if (rank === 1) badge = 'Campus Scholar';
      else if (rank === 2) badge = 'Master Contributor';
      else if (rank === 3) badge = 'Senior Contributor';
      else if (item.verifiedUploads >= 10) badge = 'Star Contributor';
      else if (item.verifiedUploads >= 5) badge = 'Campus Helper';

      return {
        rank,
        badge,
        ...item
      };
    });

    return sendResponse(res, {
      statusCode: 200,
      message: 'Leaderboard retrieved successfully',
      data: rankedContributors
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getLeaderboard
};

