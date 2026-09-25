const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
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
      required: [true, 'Branch is required'],
      trim: true
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
      index: true
    },
    unit: {
      type: Number,
      min: 1,
      max: 10,
      default: null
    },
    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      set: (val) => {
        if (!val) return 'Notes';
        const lower = String(val).toLowerCase();
        if (lower === 'notes') return 'Notes';
        if (lower === 'pyq') return 'PYQ';
        if (lower === 'assignment') return 'Assignment';
        if (lower === 'practical' || lower === 'labfile' || lower === 'practicalfile') return 'PracticalFile';
        if (lower === 'syllabus' || lower === 'studyguide') return 'StudyGuide';
        if (lower === 'questionbank') return 'QuestionBank';
        return val.charAt(0).toUpperCase() + val.slice(1);
      },
      enum: {
        values: [
          'Notes',
          'PYQ',
          'Assignment',
          'LabFile',
          'PracticalFile',
          'QuestionBank',
          'StudyGuide',
          'Other',
          'notes',
          'pyq',
          'assignment',
          'practical',
          'syllabus'
        ],
        message: '{VALUE} is not a supported resource type'
      }
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true
    },
    fileKey: {
      type: String,
      required: [true, 'File storage key is required'],
      trim: true
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required']
    },
    fileHash: {
      type: String,
      default: null,
      trim: true
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required'],
      index: true
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true
    },
    downloadsCount: {
      type: Number,
      default: 0,
      min: 0,
      alias: 'downloadCount'
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    examYear: {
      type: Number,
      default: null
    },
    examType: {
      type: String,
      enum: ['End Semester', 'Mid Semester', 'Class Test', 'Other', ''],
      default: ''
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => (Array.isArray(tags) ? tags.map((t) => t.toLowerCase().trim()).filter(Boolean) : [])
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

resourceSchema.index({ subjectId: 1, verificationStatus: 1, resourceType: 1 });
resourceSchema.index({ collegeId: 1, branch: 1, semester: 1, verificationStatus: 1 });
resourceSchema.index({ uploaderId: 1, verificationStatus: 1 });
resourceSchema.index({ fileHash: 1, collegeId: 1 });
resourceSchema.index({ averageRating: -1, ratingsCount: -1 });
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
