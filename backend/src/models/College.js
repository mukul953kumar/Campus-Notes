const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
      unique: true
    },
    code: {
      type: String,
      required: [true, 'College code is required'],
      trim: true,
      uppercase: true,
      unique: true
    },
    allowedDomains: {
      type: [String],
      required: [true, 'At least one allowed email domain is required'],
      validate: {
        validator: (domains) => Array.isArray(domains) && domains.length > 0,
        message: 'College must have at least one allowed domain'
      },
      set: (domains) => domains.map((domain) => domain.toLowerCase().trim())
    },
    branches: {
      type: [String],
      default: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

collegeSchema.index({ allowedDomains: 1 });

const College = mongoose.model('College', collegeSchema);

module.exports = College;
