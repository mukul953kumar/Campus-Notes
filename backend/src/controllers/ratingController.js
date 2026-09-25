const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const Resource = require('../models/Resource');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/apiResponse');

/**
 * Helper to recalculate and cache average rating and count on Resource
 */
const updateResourceRatingSummary = async (resourceId) => {
  const objectId = new mongoose.Types.ObjectId(resourceId);
  const stats = await Rating.aggregate([
    { $match: { resourceId: objectId } },
    {
      $group: {
        _id: '$resourceId',
        averageRating: { $avg: '$rating' },
        ratingsCount: { $sum: 1 }
      }
    }
  ]);

  const averageRating = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
  const ratingsCount = stats.length > 0 ? stats[0].ratingsCount : 0;

  await Resource.findByIdAndUpdate(resourceId, {
    averageRating,
    ratingsCount
  });

  return { averageRating, ratingsCount };
};

/**
 * Submit or update a rating for a specific resource
 * POST /api/resources/:id/ratings
 */
const submitRating = async (req, res, next) => {
  try {
    const { id: resourceId } = req.params;
    const { rating, review = '' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return next(new AppError('Invalid resource ID format', 400));
    }

    const resource = await Resource.findById(resourceId);
    if (!resource || !resource.isActive) {
      return next(new AppError('Resource not found or no longer available.', 404));
    }

    const numericRating = Number(rating);
    if (!numericRating || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return next(new AppError('Please provide a valid rating score between 1 and 5 stars.', 400));
    }

    const cleanReview = typeof review === 'string' ? review.trim().slice(0, 500) : '';

    const savedRating = await Rating.findOneAndUpdate(
      {
        resourceId,
        userId: req.user._id
      },
      {
        rating: numericRating,
        review: cleanReview
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    ).populate('userId', 'name avatar role');

    const summary = await updateResourceRatingSummary(resourceId);

    return sendResponse(res, {
      statusCode: 200,
      message: 'Thank you! Your rating has been submitted successfully.',
      data: {
        userRating: savedRating,
        averageRating: summary.averageRating,
        ratingsCount: summary.ratingsCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all ratings and reviews for a resource with breakdown
 * GET /api/resources/:id/ratings
 */
const getResourceRatings = async (req, res, next) => {
  try {
    const { id: resourceId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return next(new AppError('Invalid resource ID format', 400));
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const objectId = new mongoose.Types.ObjectId(resourceId);

    // Distribution breakdown for 1 to 5 stars
    const [ratings, total, distribution, userRating] = await Promise.all([
      Rating.find({ resourceId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name avatar role')
        .lean(),
      Rating.countDocuments({ resourceId }),
      Rating.aggregate([
        { $match: { resourceId: objectId } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        }
      ]),
      req.user ? Rating.findOne({ resourceId, userId: req.user._id }).lean() : null
    ]);

    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalScore = 0;
    distribution.forEach((d) => {
      if (starCounts[d._id] !== undefined) {
        starCounts[d._id] = d.count;
        totalScore += d._id * d.count;
      }
    });

    const averageRating = total > 0 ? Math.round((totalScore / total) * 10) / 10 : 0;

    return sendResponse(res, {
      statusCode: 200,
      message: 'Resource ratings retrieved successfully',
      data: {
        ratings,
        summary: {
          averageRating,
          totalRatings: total,
          distribution: starCounts
        },
        userRating: userRating || null
      },
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

/**
 * Get current user's rating for a resource
 * GET /api/resources/:id/my-rating
 */
const getUserRating = async (req, res, next) => {
  try {
    const { id: resourceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return next(new AppError('Invalid resource ID format', 400));
    }

    const rating = await Rating.findOne({
      resourceId,
      userId: req.user._id
    }).lean();

    return sendResponse(res, {
      statusCode: 200,
      message: 'User rating retrieved successfully',
      data: rating || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user's rating for a resource
 * DELETE /api/resources/:id/ratings
 */
const deleteUserRating = async (req, res, next) => {
  try {
    const { id: resourceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return next(new AppError('Invalid resource ID format', 400));
    }

    const deleted = await Rating.findOneAndDelete({
      resourceId,
      userId: req.user._id
    });

    if (!deleted) {
      return next(new AppError('Rating not found or already deleted.', 404));
    }

    const summary = await updateResourceRatingSummary(resourceId);

    return sendResponse(res, {
      statusCode: 200,
      message: 'Your rating has been removed.',
      data: {
        averageRating: summary.averageRating,
        ratingsCount: summary.ratingsCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitRating,
  getResourceRatings,
  getUserRating,
  deleteUserRating
};
