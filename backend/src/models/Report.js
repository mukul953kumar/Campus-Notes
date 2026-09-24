const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: [true, 'Resource ID is required for a report']
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter user ID is required']
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for reporting this document'],
      enum: {
        values: [
          'wrong_subject',
          'poor_quality',
          'broken_pdf',
          'duplicate',
          'copyright',
          'inappropriate',
          'other'
        ],
        message: 'Invalid report reason category'
      }
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending'
    },
    resolutionNote: {
      type: String,
      default: ''
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ resourceId: 1, reporterId: 1, status: 1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
