const Resource = require('../models/Resource');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/apiResponse');

const getResources = async (req, res, next) => {
  try {
    const {
      branch,
      semester,
      subjectId,
      unit,
      resourceType,
      examYear,
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      isActive: true,
      verificationStatus: 'verified'
    };

    if (branch) filter.branch = branch;
    if (subjectId) filter.subjectId = subjectId;
    if (resourceType) filter.resourceType = resourceType;

    if (semester) {
      const semNum = Number(semester);
      if (!isNaN(semNum)) filter.semester = semNum;
    }

    if (unit) {
      const unitNum = Number(unit);
      if (!isNaN(unitNum)) filter.unit = unitNum;
    }

    if (examYear) {
      const yearNum = Number(examYear);
      if (!isNaN(yearNum)) filter.examYear = yearNum;
    }

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('subjectId', 'name code shortName')
        .populate('uploaderId', 'name avatar role')
        .populate('collegeId', 'name code')
        .lean(),
      Resource.countDocuments(filter)
    ]);

    return sendResponse(res, {
      statusCode: 200,
      message: 'Resources retrieved successfully',
      data: resources,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasMore: pageNum * limitNum < total
      }
    });
  } catch (error) {
    next(error);
  }
};

const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('subjectId', 'name code shortName unitsCount')
      .populate('uploaderId', 'name avatar role stats')
      .populate('collegeId', 'name code')
      .lean();

    if (!resource || !resource.isActive) {
      return next(new AppError('Resource not found or no longer available.', 404));
    }

    if (resource.verificationStatus !== 'verified') {
      const isUploader = req.user && String(req.user._id) === String(resource.uploaderId._id);
      const isAdmin = req.user && req.user.role === 'admin';

      if (!isUploader && !isAdmin) {
        return next(new AppError('This resource is currently pending administrative verification.', 403));
      }
    }

    return sendResponse(res, {
      statusCode: 200,
      message: 'Resource details retrieved successfully',
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  getResourceById
};
