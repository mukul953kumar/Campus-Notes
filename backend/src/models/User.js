const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'College email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    googleId: {
      type: String,
      sparse: true,
      index: true
    },
    avatar: {
      type: String,
      default: ''
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College reference is required'],
      index: true
    },
    branch: {
      type: String,
      trim: true,
      default: ''
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: null
    },
    graduationYear: {
      type: Number,
      default: null
    },
    role: {
      type: String,
      enum: ['student', 'contributor', 'admin'],
      default: 'student'
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    stats: {
      uploadsCount: {
        type: Number,
        default: 0
      },
      verifiedUploadsCount: {
        type: Number,
        default: 0
      },
      downloadsReceived: {
        type: Number,
        default: 0
      },
      helpfulVotes: {
        type: Number,
        default: 0
      }
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

userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
