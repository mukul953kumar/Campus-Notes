const Subject = require('../models/Subject');
const College = require('../models/College');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/apiResponse');

const getBranches = async (req, res, next) => {
  try {
    const { collegeCode } = req.query;

    let college;
    if (collegeCode) {
      college = await College.findOne({ code: collegeCode.toUpperCase(), isActive: true });
    } else if (req.user && req.user.collegeId) {
      college = await College.findById(req.user.collegeId);
    } else {
      college = await College.findOne({ code: 'KNIT', isActive: true });
    }

    if (!college) {
      return next(new AppError('College not found.', 404));
    }

    return sendResponse(res, {
      statusCode: 200,
      message: 'Branches retrieved successfully',
      data: {
        college: { id: college._id, name: college.name, code: college.code },
        branches: college.branches
      }
    });
  } catch (error) {
    next(error);
  }
};

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getSubjects = async (req, res, next) => {
  try {
    const { branch, semester, collegeId, search } = req.query;

    const filter = { isActive: true };

    let targetCollegeId = collegeId;
    if (!targetCollegeId && req.user && req.user.collegeId) {
      targetCollegeId = req.user.collegeId?._id || req.user.collegeId;
    }
    if (!targetCollegeId) {
      const defaultCollege = await College.findOne({ code: 'KNIT', isActive: true });
      if (defaultCollege) targetCollegeId = defaultCollege._id;
    }

    if (targetCollegeId) {
      filter.collegeId = targetCollegeId;
    }

    if (branch) {
      filter.branch = branch;
    }

    if (semester) {
      const semNum = Number(semester);
      if (!isNaN(semNum)) {
        filter.semester = semNum;
      }
    }

    if (search) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { code: { $regex: safeSearch, $options: 'i' } },
        { shortName: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    let subjects = await Subject.find(filter)
      .sort({ semester: 1, name: 1 })
      .populate('collegeId', 'name code')
      .lean();

    // Fallback: If no subjects found for specific branch, provide semester subjects
    if (subjects.length === 0 && branch && filter.semester) {
      const fallbackFilter = { ...filter };
      delete fallbackFilter.branch;
      subjects = await Subject.find(fallbackFilter)
        .sort({ semester: 1, name: 1 })
        .populate('collegeId', 'name code')
        .lean();
    }

    return sendResponse(res, {
      statusCode: 200,
      message: 'Subjects retrieved successfully',
      data: subjects
    });
  } catch (error) {
    next(error);
  }
};

const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('collegeId', 'name code')
      .lean();

    if (!subject) {
      return next(new AppError('Subject not found.', 404));
    }

    const units = Array.from({ length: subject.unitsCount }, (_, index) => ({
      unitNumber: index + 1,
      title: `Unit ${index + 1}`
    }));

    return sendResponse(res, {
      statusCode: 200,
      message: 'Subject details retrieved successfully',
      data: {
        ...subject,
        units
      }
    });
  } catch (error) {
    next(error);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { name, code, collegeId, branch, semester, unitsCount = 5, description = '' } = req.body;

    if (!name || !code || !collegeId || !branch || !semester) {
      return next(new AppError('Name, code, collegeId, branch, and semester are required.', 400));
    }

    const targetCollegeId = collegeId;
    const existing = await Subject.findOne({
      code: code.toUpperCase(),
      collegeId: targetCollegeId
    });

    if (existing) {
      return next(new AppError('A subject with this code already exists for this college.', 409));
    }

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      collegeId: targetCollegeId,
      branch,
      semester: Number(semester),
      unitsCount: Number(unitsCount),
      description
    });

    return sendResponse(res, {
      statusCode: 201,
      message: 'Subject created successfully',
      data: subject
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBranches,
  getSubjects,
  getSubjectById,
  createSubject
};
