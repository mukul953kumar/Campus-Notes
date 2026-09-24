const Bookmark = require('../models/Bookmark');
const Resource = require('../models/Resource');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/apiResponse');

const toggleBookmark = async (req, res, next) => {
  try {
    const { resourceId } = req.params;

    const resource = await Resource.findById(resourceId);
    if (!resource || !resource.isActive) {
      return next(new AppError('Resource not found or no longer available.', 404));
    }

    const existingBookmark = await Bookmark.findOne({
      userId: req.user._id,
      resourceId
    });

    if (existingBookmark) {
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      return sendResponse(res, {
        statusCode: 200,
        message: 'Bookmark removed successfully',
        data: { isBookmarked: false, resourceId }
      });
    }

    await Bookmark.create({
      userId: req.user._id,
      resourceId
    });

    return sendResponse(res, {
      statusCode: 201,
      message: 'Resource bookmarked successfully',
      data: { isBookmarked: true, resourceId }
    });
  } catch (error) {
    next(error);
  }
};

const getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'resourceId',
        match: { isActive: true },
        populate: [
          { path: 'subjectId', select: 'name code shortName' },
          { path: 'uploaderId', select: 'name avatar role' },
          { path: 'collegeId', select: 'name code' }
        ]
      })
      .lean();

    // Filter out bookmarks where the underlying resource was removed
    const validBookmarks = bookmarks
      .filter((b) => b.resourceId !== null)
      .map((b) => ({
        bookmarkId: b._id,
        savedAt: b.createdAt,
        ...b.resourceId
      }));

    return sendResponse(res, {
      statusCode: 200,
      message: 'Bookmarks retrieved successfully',
      data: validBookmarks
    });
  } catch (error) {
    next(error);
  }
};

const getBookmarkIds = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .select('resourceId')
      .lean();

    const bookmarkIds = bookmarks.map((b) => String(b.resourceId));

    return sendResponse(res, {
      statusCode: 200,
      message: 'Bookmark IDs retrieved successfully',
      data: bookmarkIds
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleBookmark,
  getBookmarks,
  getBookmarkIds
};
