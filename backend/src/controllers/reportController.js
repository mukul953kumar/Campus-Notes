const Report = require('../models/Report');
const Resource = require('../models/Resource');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/apiResponse');

const createReport = async (req, res, next) => {
  try {
    const { resourceId, reason, description = '' } = req.body;

    if (!resourceId || !reason) {
      return next(new AppError('Resource ID and a reason are required to submit a report.', 400));
    }

    const resource = await Resource.findById(resourceId);
    if (!resource || !resource.isActive) {
      return next(new AppError('Resource not found or no longer available.', 404));
    }

    const existingPendingReport = await Report.findOne({
      resourceId,
      reporterId: req.user._id,
      status: 'pending'
    });

    if (existingPendingReport) {
      return next(new AppError('You have already submitted a pending report for this material.', 409));
    }

    const report = await Report.create({
      resourceId,
      reporterId: req.user._id,
      reason,
      description: description.trim()
    });

    const populatedReport = await Report.findById(report._id)
      .populate('resourceId', 'title fileUrl verificationStatus')
      .populate('reporterId', 'name email');

    return sendResponse(res, {
      statusCode: 201,
      message: 'Report submitted successfully. Our moderators will review this document.',
      data: populatedReport
    });
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status && ['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'resourceId',
        select: 'title fileUrl verificationStatus branch semester uploaderId subjectId',
        populate: [
          { path: 'subjectId', select: 'name code shortName' },
          { path: 'uploaderId', select: 'name email role' }
        ]
      })
      .populate('reporterId', 'name email')
      .populate('resolvedBy', 'name email')
      .lean();

    return sendResponse(res, {
      statusCode: 200,
      message: 'Reports retrieved successfully',
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote = '' } = req.body;

    if (!status || !['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return next(new AppError('Valid status is required (pending, reviewed, resolved, dismissed).', 400));
    }

    const report = await Report.findById(id);
    if (!report) {
      return next(new AppError('Report not found.', 404));
    }

    report.status = status;
    report.resolutionNote = resolutionNote;
    report.resolvedBy = req.user._id;
    await report.save();

    const updated = await Report.findById(id)
      .populate('resourceId', 'title fileUrl')
      .populate('reporterId', 'name email')
      .populate('resolvedBy', 'name');

    return sendResponse(res, {
      statusCode: 200,
      message: `Report marked as ${status}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus
};
