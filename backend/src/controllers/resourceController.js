const Resource = require('../models/Resource');
const Subject = require('../models/Subject');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/apiResponse');
const { uploadFile } = require('../services/storageService');
const { verifyPdfMagicBytes, computeFileHash } = require('../utils/fileValidator');

const getResources = async (req, res, next) => {
  try {
    const {
      search,
      q,
      branch,
      semester,
      subjectId,
      unit,
      resourceType,
      examYear,
      sortBy = 'recent',
      page = 1,
      limit = 20
    } = req.query;

    const searchTerm = (search || q || '').trim();
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

    if (searchTerm) {
      const matchedSubjects = await Subject.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { code: { $regex: searchTerm, $options: 'i' } },
          { shortName: { $regex: searchTerm, $options: 'i' } }
        ]
      }).select('_id');

      const matchedSubjectIds = matchedSubjects.map((s) => s._id);

      const searchConditions = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } }
      ];

      if (matchedSubjectIds.length > 0) {
        searchConditions.push({ subjectId: { $in: matchedSubjectIds } });
      }

      filter.$or = searchConditions;
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'popular' || sortBy === 'downloads') {
      sort = { downloadsCount: -1, createdAt: -1 };
    } else if (sortBy === 'title') {
      sort = { title: 1 };
    }

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort(sort)
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

const uploadResource = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please select a PDF document to upload.', 400));
    }

    verifyPdfMagicBytes(req.file.buffer);

    const fileHash = computeFileHash(req.file.buffer);

    const duplicate = await Resource.findOne({
      fileHash,
      collegeId: req.user.collegeId,
      isActive: true
    });

    if (duplicate) {
      return next(new AppError('Duplicate document: This study material has already been uploaded for your college.', 409));
    }

    const {
      title,
      description = '',
      branch,
      semester,
      subjectId,
      unit,
      resourceType,
      examYear,
      examType = '',
      tags
    } = req.body;

    if (!title || !subjectId || !resourceType) {
      return next(new AppError('Title, subjectId, and resourceType are required.', 400));
    }

    const subject = await Subject.findById(subjectId);
    if (!subject || !subject.isActive) {
      return next(new AppError('Selected academic subject is invalid or not available.', 404));
    }

    const storageResult = await uploadFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: 'application/pdf',
      folder: 'academic-resources'
    });

    const parsedTags = Array.isArray(tags)
      ? tags
      : (typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []);

    const resource = await Resource.create({
      title,
      description,
      collegeId: req.user.collegeId,
      branch: branch || subject.branch,
      semester: Number(semester) || subject.semester,
      subjectId,
      unit: unit ? Number(unit) : null,
      resourceType,
      fileUrl: storageResult.fileUrl,
      fileKey: storageResult.fileKey,
      fileSize: storageResult.fileSize,
      fileHash,
      uploaderId: req.user._id,
      verificationStatus: 'pending',
      examYear: examYear ? Number(examYear) : null,
      examType,
      tags: parsedTags
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.uploadsCount': 1 }
    });

    const populatedResource = await Resource.findById(resource._id)
      .populate('subjectId', 'name code shortName')
      .populate('uploaderId', 'name avatar role')
      .populate('collegeId', 'name code');

    return sendResponse(res, {
      statusCode: 201,
      message: 'Study material uploaded successfully. It will be verified by moderators shortly.',
      data: populatedResource
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  getResourceById,
  uploadResource
};
