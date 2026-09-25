const User = require('../models/User');
const Resource = require('../models/Resource');
const Report = require('../models/Report');
const Bookmark = require('../models/Bookmark');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/apiResponse');

// Escape helper for regex search
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 1. Overview & Platform Metrics
const getAdminMetrics = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalAdmins,
      totalResources,
      pendingCount,
      verifiedCount,
      rejectedCount,
      pendingReportsCount,
      downloadStats
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'admin', isActive: true }),
      Resource.countDocuments({ isActive: true }),
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
        totalAdmins,
        totalResources,
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

// 2. Verification Queue
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
      .populate('uploaderId', 'name email avatar role stats')
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

// 3. All Resources Catalog (Search, Filter & Manage Any Note)
const getAllResourcesAdmin = async (req, res, next) => {
  try {
    const {
      search,
      branch,
      semester,
      resourceType,
      status, // 'all' | 'verified' | 'pending' | 'rejected'
      isActive, // 'all' | 'true' | 'false'
      sortBy = 'recent',
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    // Filter by verification status
    if (status && status !== 'all') {
      filter.verificationStatus = status;
    }

    // Filter by active / deactivated status
    if (isActive !== undefined && isActive !== 'all') {
      filter.isActive = isActive === 'true';
    } else if (!isActive) {
      filter.isActive = true;
    }

    if (branch) filter.branch = branch;
    if (resourceType) filter.resourceType = resourceType;
    if (semester) {
      const semNum = Number(semester);
      if (!isNaN(semNum)) filter.semester = semNum;
    }

    if (search && search.trim()) {
      const safe = escapeRegex(search.trim());
      filter.$or = [
        { title: { $regex: safe, $options: 'i' } },
        { description: { $regex: safe, $options: 'i' } },
        { tags: { $regex: safe, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    let sortOption = { createdAt: -1 };
    if (sortBy === 'downloads') sortOption = { downloadsCount: -1 };
    if (sortBy === 'title') sortOption = { title: 1 };
    if (sortBy === 'oldest') sortOption = { createdAt: 1 };

    const [total, resources] = await Promise.all([
      Resource.countDocuments(filter),
      Resource.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('subjectId', 'name code shortName')
        .populate('uploaderId', 'name email avatar role')
        .populate('collegeId', 'name code')
        .lean()
    ]);

    return sendResponse(res, {
      statusCode: 200,
      message: 'All resources catalog retrieved for admin',
      data: resources,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4. Verify / Reject Resource
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

      // Increment uploader's approvedCount and verifiedUploadsCount
      if (resource.uploaderId) {
        await User.findByIdAndUpdate(resource.uploaderId, {
          $inc: { 'stats.approvedCount': 1, 'stats.verifiedUploadsCount': 1 }
        });
      }

      const populated = await Resource.findById(id)
        .populate('subjectId', 'name code shortName')
        .populate('uploaderId', 'name email avatar role');

      return sendResponse(res, {
        statusCode: 200,
        message: 'Resource verified and approved. It is now live in the library.',
        data: populated
      });
    }

    if (action === 'reject') {
      resource.verificationStatus = 'rejected';
      resource.rejectionReason = rejectionReason.trim() || 'Document does not conform to academic quality standards.';
      await resource.save();

      const populated = await Resource.findById(id)
        .populate('subjectId', 'name code shortName')
        .populate('uploaderId', 'name email avatar role');

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

// 5. Delete or Deactivate ANY Resource (Universal Admin Delete)
const deleteResourceAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);
    if (!resource) {
      return next(new AppError('Resource not found.', 404));
    }

    // Soft delete resource from live library
    resource.isActive = false;
    await resource.save();

    // Clean up bookmarks for this resource
    await Bookmark.deleteMany({ resourceId: id });

    // Mark any open reports for this resource as resolved
    await Report.updateMany(
      { resourceId: id, status: 'pending' },
      { status: 'resolved', resolutionNote: 'Resource deleted and deactivated by administrator.' }
    );

    return sendResponse(res, {
      statusCode: 200,
      message: 'Study material deleted and permanently removed from public circulation.',
      data: { id, title: resource.title }
    });
  } catch (error) {
    next(error);
  }
};

// 6. User Management: List All Registered Users
const getAllUsersAdmin = async (req, res, next) => {
  try {
    const { search, role, branch, semester, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (branch) filter.branch = branch;
    if (semester) {
      const semNum = Number(semester);
      if (!isNaN(semNum)) filter.semester = semNum;
    }
    if (isActive !== undefined && isActive !== 'all') {
      filter.isActive = isActive === 'true';
    }

    if (search && search.trim()) {
      const safe = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: safe, $options: 'i' } },
        { email: { $regex: safe, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-passwordHash')
        .populate('collegeId', 'name code')
        .lean()
    ]);

    return sendResponse(res, {
      statusCode: 200,
      message: 'User directory retrieved for admin',
      data: users,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// 7. User Management: Update User Role or Status
const updateUserAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    // Prevent admin from locking their own account
    if (String(req.user._id) === String(id) && isActive === false) {
      return next(new AppError('You cannot deactivate your own administrative account.', 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User account not found.', 404));
    }

    if (role && ['student', 'contributor', 'admin'].includes(role)) {
      user.role = role;
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    await user.save();

    return sendResponse(res, {
      statusCode: 200,
      message: `User ${user.name} successfully updated.`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminMetrics,
  getVerificationQueue,
  getAllResourcesAdmin,
  verifyResource,
  deleteResourceAdmin,
  getAllUsersAdmin,
  updateUserAdmin
};
