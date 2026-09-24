const crypto = require('crypto');
const AppError = require('./appError');

const verifyPdfMagicBytes = (buffer) => {
  if (!buffer || buffer.length < 5) {
    throw new AppError('Invalid or corrupted file content.', 400);
  }

  // PDF files must start with %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
  const isPdf =
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2D;

  if (!isPdf) {
    throw new AppError('File format validation failed: Uploaded file is not a valid PDF document.', 400);
  }

  return true;
};

const computeFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

module.exports = {
  verifyPdfMagicBytes,
  computeFileHash
};
