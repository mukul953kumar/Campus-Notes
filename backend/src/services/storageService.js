const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const AppError = require('../utils/appError');

const localUploadsDir = path.join(__dirname, '../../uploads');

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const ensureLocalDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const sanitizeFileName = (fileName) => {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/-+/g, '-');
};

const uploadFile = async ({ buffer, originalName, mimeType, folder = 'resources' }) => {
  if (!buffer || buffer.length === 0) {
    throw new AppError('File buffer is empty or missing.', 400);
  }

  const safeName = sanitizeFileName(originalName || 'document.pdf');
  const uniquePrefix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  const fileKey = `${uniquePrefix}-${safeName}`;

  // 1. Cloudinary Free Cloud Storage
  if (isCloudinaryConfigured()) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: `campus-notes/${folder}`,
          public_id: fileKey
        },
        (error, res) => {
          if (error) return reject(error);
          resolve(res);
        }
      );
      stream.end(buffer);
    });

    return {
      fileUrl: result.secure_url,
      fileKey: result.public_id,
      fileSize: buffer.length,
      storageType: 'cloudinary'
    };
  }

  // 2. Local fallback storage
  const targetDir = path.join(localUploadsDir, folder);
  ensureLocalDirectory(targetDir);

  const localFilePath = path.join(targetDir, fileKey);
  await fs.promises.writeFile(localFilePath, buffer);

  return {
    fileUrl: `/uploads/${folder}/${fileKey}`,
    fileKey: `${folder}/${fileKey}`,
    fileSize: buffer.length,
    storageType: 'local'
  };
};

const getSignedDownloadUrl = async (fileKey) => {
  if (fileKey && (fileKey.startsWith('http://') || fileKey.startsWith('https://'))) {
    return fileKey;
  }

  if (isCloudinaryConfigured()) {
    return cloudinary.url(fileKey, { resource_type: 'raw', secure: true });
  }

  return `/uploads/${fileKey}`;
};

const deleteFile = async (fileKey) => {
  if (!fileKey) return;

  if (isCloudinaryConfigured()) {
    try {
      await cloudinary.uploader.destroy(fileKey, { resource_type: 'raw' });
      return;
    } catch (err) {
      console.error('[Cloudinary Delete Error]', err.message);
    }
  }

  const localFilePath = path.join(localUploadsDir, fileKey);
  if (fs.existsSync(localFilePath)) {
    await fs.promises.unlink(localFilePath);
  }
};

module.exports = {
  uploadFile,
  getSignedDownloadUrl,
  deleteFile,
  localUploadsDir
};
