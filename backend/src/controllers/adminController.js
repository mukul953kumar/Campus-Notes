const User = require('../models/User');
const Resource = require('../models/Resource');
const Report = require('../models/Report');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/apiResponse');

const getAdminMetrics = async (req, res, next) => {
  try {
    const [
      totalStudents,
      pendingCount,
      verifiedCount,
      rejectedCount,
      pendingReportsCount,
      downloadStats
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      Resource.countDocuments({ verificationStatus: 'pending', isActive: true }),
      Resource.countDocuments({ verificationStatus: 'verified', isActive: true }),
      Resource.countDocuments({ verificationStatus: 'rejected', isActive: true }),
      Report.countDocuments({ status: 'pending' }),
      Resource.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalDownloads: { $sum: '$downloadsCount' } } }
      ])
    ]);

    const totalDownloads = downloadStats.length > 0 ? downloadStats[0].totalDownloads : 0;

    return sendResponse(res, {
      statusCode: 200,
      message: 'Admin metrics retrieved successfully',
      data: {
        totalStudents,
        pendingCount,
        verifiedCount,
        rejectedCount,
        pendingReportsCount,
        totalDownloads
      }
    });
  } catch (error) {
    next(error);
  }
};

const getVerificationQueue = async (req, res, next) => {
  try {
    const { branch, semester, resourceType } = req.query;

    const filter = {
      verificationStatus: 'pending',
      isActive: true
    };

    if (branch) filter.branch = branch;
    if (resourceType) filter.resourceType = resourceType;
    if (semester) {
      const semNum = Number(semester);
      if (!isNaN(semNum)) filter.semester = semNum;
    }

    const pendingResources = await Resource.find(filter)
      .sort({ createdAt: 1 })
      .populate('subjectId', 'name code shortName')
      .populate('uploaderId', 'name email avatar role')
      .populate('collegeId', 'name code')
      .lean();

    return sendResponse(res, {
      statusCode: 200,
      message: 'Verification queue retrieved successfully',
      data: pendingResources
    });
  } catch (error) {
    next(error);
  }
};

const verifyResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason = '' } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return next(new AppError("Action must be either 'approve' or 'reject'.", 400));
    }

    const resource = await Resource.findById(id);
    if (!resource || !resource.isActive) {
      return next(new AppError('Resource not found or no longer available.', 404));
    }

    if (action === 'approve') {
      resource.verificationStatus = 'verified';
      resource.rejectionReason = '';
      await resource.save();

      // Increment uploader's approvedCount
      if (resource.uploaderId) {
        await User.findByIdAndUpdate(resource.uploaderId, {
          $inc: { 'stats.approvedCount': 1 }
        });
      }

      const populated = await Resource.findById(id)
        .populate('subjectId', 'name code shortName')
        .populate('uploaderId', 'name email');

      return sendResponse(res, {
        statusCode: 200,
        message: 'Resource verified and approved. It is now live in the library.',
        data: populated
      });
    }

    if (action === 'reject') {
      resource.verificationStatus = 'rejected';
      resource.rejectionReason = rejectionReason.trim() || 'Document does not conform to KNIT academic quality standards.';
      await resource.save();

      const populated = await Resource.findById(id)
        .populate('subjectId', 'name code shortName')
        .populate('uploaderId', 'name email');

      return sendResponse(res, {
        statusCode: 200,
        message: 'Resource rejected and marked with feedback note.',
        data: populated
      });
    }
  } catch (error) {
    next(error);
  }
};

const deleteResourceAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);
    if (!resource) {
      return next(new AppError('Resource not found.', 404));
    }

    resource.isActive = false;
    await resource.save();

    // Mark any open reports for this resource as resolved
    await Report.updateMany(
      { resourceId: id, status: 'pending' },
      { status: 'resolved', resolutionNote: 'Resource deactivated by administrator.' }
    );

    return sendResponse(res, {
      statusCode: 200,
      message: 'Resource successfully deactivated and removed from circulation.',
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminMetrics,
  getVerificationQueue,
  verifyResource,
  deleteResourceAdmin
};
