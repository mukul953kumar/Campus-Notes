const College = require('../models/College');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/apiResponse');

const getAllColleges = async (req, res, next) => {
  try {
    const colleges = await College.find({ isActive: true })
      .select('name code allowedDomains branches')
      .lean();

    return sendResponse(res, {
      statusCode: 200,
      message: 'Colleges retrieved successfully',
      data: colleges
    });
  } catch (error) {
    next(error);
  }
};

const getCollegeById = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return next(new AppError('College not found', 404));
    }

    return sendResponse(res, {
      statusCode: 200,
      message: 'College retrieved successfully',
      data: college
    });
  } catch (error) {
    next(error);
  }
};

const createCollege = async (req, res, next) => {
  try {
    const { name, code, allowedDomains, branches } = req.body;

    if (!name || !code || !allowedDomains) {
      return next(new AppError('Name, code, and allowed domains are required', 400));
    }

    const existingCollege = await College.findOne({
      $or: [{ code: code.toUpperCase() }, { name }]
    });

    if (existingCollege) {
      return next(new AppError('A college with this name or code already exists', 409));
    }

    const college = await College.create({
      name,
      code,
      allowedDomains,
      branches
    });

    return sendResponse(res, {
      statusCode: 201,
      message: 'College created successfully',
      data: college
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllColleges,
  getCollegeById,
  createCollege
};
