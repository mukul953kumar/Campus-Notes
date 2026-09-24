const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ext !== '.pdf' || mime !== 'application/pdf') {
    return cb(new AppError('Only PDF files (.pdf) are allowed for upload.', 400), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB max limit
  },
  fileFilter
});

module.exports = upload;
