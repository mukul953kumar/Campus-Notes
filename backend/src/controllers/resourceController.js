const Resource = require('../models/Resource');
const Subject = require('../models/Subject');
const User = require('../models/User');
const College = require('../models/College');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/apiResponse');
const { uploadFile, getSignedDownloadUrl, isCloudinaryConfigured, localUploadsDir } = require('../services/storageService');
const { verifyPdfMagicBytes, computeFileHash } = require('../utils/fileValidator');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// In-memory cache to deduplicate view counts within a 60-second window (prevents double-counting from React StrictMode & refreshes)
const recentViewsMap = new Map();
const VIEW_COOLDOWN_MS = 60 * 1000;

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentViewsMap.entries()) {
    if (now - timestamp > VIEW_COOLDOWN_MS) {
      recentViewsMap.delete(key);
    }
  }
}, 5 * 60 * 1000);
if (cleanupTimer.unref) cleanupTimer.unref();

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeResourceType = (type) => {
  if (!type) return '';
  const lower = String(type).toLowerCase();
  if (lower === 'notes') return 'Notes';
  if (lower === 'pyq') return 'PYQ';
  if (lower === 'assignment') return 'Assignment';
  if (lower === 'practical' || lower === 'labfile' || lower === 'practicalfile') return 'PracticalFile';
  if (lower === 'syllabus' || lower === 'studyguide') return 'StudyGuide';
  if (lower === 'questionbank') return 'QuestionBank';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

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
    const safeSearchTerm = escapeRegex(searchTerm);
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      isActive: true,
      verificationStatus: 'verified'
    };

    if (branch) filter.branch = branch;
    if (subjectId) filter.subjectId = subjectId;
    if (resourceType) {
      const normalized = normalizeResourceType(resourceType);
      filter.resourceType = { $in: [resourceType, normalized, resourceType.toLowerCase(), resourceType.toUpperCase()] };
    }

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
          { name: { $regex: safeSearchTerm, $options: 'i' } },
          { code: { $regex: safeSearchTerm, $options: 'i' } },
          { shortName: { $regex: safeSearchTerm, $options: 'i' } }
        ]
      }).select('_id');

      const matchedSubjectIds = matchedSubjects.map((s) => s._id);

      const searchConditions = [
        { title: { $regex: safeSearchTerm, $options: 'i' } },
        { description: { $regex: safeSearchTerm, $options: 'i' } },
        { tags: { $regex: safeSearchTerm, $options: 'i' } }
      ];

      if (matchedSubjectIds.length > 0) {
        searchConditions.push({ subjectId: { $in: matchedSubjectIds } });
      }

      filter.$or = searchConditions;
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'popular' || sortBy === 'downloads') {
      sort = { downloadsCount: -1, createdAt: -1 };
    } else if (sortBy === 'rating' || sortBy === 'top-rated') {
      sort = { averageRating: -1, ratingsCount: -1, createdAt: -1 };
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

    const formattedResources = resources.map((r) => ({
      ...r,
      fileUrl: req.user ? getSignedDownloadUrl(r.fileKey, r.fileUrl) : null
    }));

    return sendResponse(res, {
      statusCode: 200,
      message: 'Resources retrieved successfully',
      data: formattedResources,
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

    // Deduplicate view counts (by User ID or Client IP + Resource ID within cooldown window)
    const clientId = req.user?._id ? String(req.user._id) : (req.ip || req.headers['x-forwarded-for'] || 'client');
    const viewKey = `${clientId}_${req.params.id}`;
    const now = Date.now();
    const lastViewTime = recentViewsMap.get(viewKey);

    let isNewView = false;
    if (!lastViewTime || (now - lastViewTime > VIEW_COOLDOWN_MS)) {
      recentViewsMap.set(viewKey, now);
      isNewView = true;
      Resource.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } }).exec();
    }

    if (isNewView) {
      resource.viewsCount = (resource.viewsCount || 0) + 1;
    }

    resource.fileUrl = getSignedDownloadUrl(resource.fileKey, resource.fileUrl);

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

    let targetCollegeId = req.user.collegeId?._id || req.user.collegeId;
    if (!targetCollegeId) {
      const defaultCollege = await College.findOne({ code: 'KNIT', isActive: true });
      targetCollegeId = defaultCollege?._id;
    }

    const duplicate = await Resource.findOne({
      fileHash,
      collegeId: targetCollegeId,
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

    const normalizedType = normalizeResourceType(resourceType) || 'Notes';

    const resource = await Resource.create({
      title,
      description,
      collegeId: targetCollegeId,
      branch: branch || subject.branch,
      semester: Number(semester) || subject.semester,
      subjectId,
      unit: unit ? Number(unit) : null,
      resourceType: normalizedType,
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

const downloadResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource || !resource.isActive) {
      return next(new AppError('Resource not found or no longer available.', 404));
    }

    if (resource.verificationStatus !== 'verified') {
      const isUploader = req.user && String(req.user._id) === String(resource.uploaderId);
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isUploader && !isAdmin) {
        return next(new AppError('This resource is currently pending administrative verification.', 403));
      }
    }

    await Resource.findByIdAndUpdate(resource._id, {
      $inc: { downloadsCount: 1 }
    });

    if (resource.uploaderId) {
      await User.findByIdAndUpdate(resource.uploaderId, {
        $inc: { 'stats.downloadsReceived': 1 }
      });
    }

    if (req.user && req.user._id) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.downloadsCount': 1 }
      });
    }

    const signedDownloadUrl = getSignedDownloadUrl(resource.fileKey, resource.fileUrl);

    return sendResponse(res, {
      statusCode: 200,
      message: 'Download URL retrieved successfully',
      data: {
        fileUrl: signedDownloadUrl,
        fileName: `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
        downloadsCount: (resource.downloadsCount || 0) + 1
      }
    });
  } catch (error) {
    next(error);
  }
};

const streamResourceFile = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource || !resource.isActive) {
      return next(new AppError('Resource not found or no longer available.', 404));
    }

    if (resource.verificationStatus !== 'verified') {
      const isUploader = req.user && String(req.user._id) === String(resource.uploaderId);
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isUploader && !isAdmin) {
        return next(new AppError('This resource is currently pending verification.', 403));
      }
    }

    const isDownload = req.query.download === 'true';
    const dispositionType = isDownload ? 'attachment' : 'inline';
    const safeFilename = `${resource.title.replace(/[^a-zA-Z0-9_.-]/g, '_')}.pdf`;

    if (isDownload) {
      await Resource.findByIdAndUpdate(resource._id, {
        $inc: { downloadsCount: 1 }
      });
      if (resource.uploaderId) {
        await User.findByIdAndUpdate(resource.uploaderId, {
          $inc: { 'stats.downloadsReceived': 1 }
        });
      }
      if (req.user && req.user._id) {
        await User.findByIdAndUpdate(req.user._id, {
          $inc: { 'stats.downloadsCount': 1 }
        });
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${safeFilename}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // If local file
    if (resource.fileKey && !resource.fileKey.startsWith('http') && !resource.fileUrl.startsWith('http')) {
      const localFilePath = path.join(localUploadsDir, resource.fileKey);
      if (fs.existsSync(localFilePath)) {
        return fs.createReadStream(localFilePath).pipe(res);
      }
    }

    // If Cloudinary / Remote file
    const targetUrl = getSignedDownloadUrl(resource.fileKey, resource.fileUrl);
    if (!targetUrl) {
      return next(new AppError('Document file could not be located.', 404));
    }

    const client = targetUrl.startsWith('https') ? https : http;
    client.get(targetUrl, (stream) => {
      if (stream.statusCode !== 200) {
        return res.redirect(targetUrl);
      }
      stream.pipe(res);
    }).on('error', () => {
      res.redirect(targetUrl);
    });
  } catch (error) {
    next(error);
  }
};

const getMyUploads = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = {
      uploaderId: req.user._id,
      isActive: true
    };

    if (status && ['pending', 'verified', 'rejected'].includes(status)) {
      filter.verificationStatus = status;
    }

    const uploads = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .populate('subjectId', 'name code shortName')
      .populate('collegeId', 'name code')
      .lean();

    const formattedUploads = uploads.map((u) => ({
      ...u,
      fileUrl: getSignedDownloadUrl(u.fileKey, u.fileUrl)
    }));

    return sendResponse(res, {
      statusCode: 200,
      message: 'Student uploads retrieved successfully',
      data: formattedUploads
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  getResourceById,
  uploadResource,
  downloadResource,
  streamResourceFile,
  getMyUploads
};

