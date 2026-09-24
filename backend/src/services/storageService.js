const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { isR2Configured, getR2Client } = require('../config/r2');
const AppError = require('../utils/appError');

const localUploadsDir = path.join(__dirname, '../../uploads');

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
  const fileKey = `${folder}/${uniquePrefix}-${safeName}`;

  if (isR2Configured()) {
    const s3Client = getR2Client();
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: mimeType || 'application/pdf'
    });

    await s3Client.send(command);

    const publicDomain = process.env.R2_PUBLIC_URL ? process.env.R2_PUBLIC_URL.replace(/\/$/, '') : null;
    const fileUrl = publicDomain ? `${publicDomain}/${fileKey}` : `/api/storage/file/${fileKey}`;

    return {
      fileUrl,
      fileKey,
      fileSize: buffer.length,
      storageType: 'r2'
    };
  }

  // Local fallback storage
  const targetDir = path.join(localUploadsDir, folder);
  ensureLocalDirectory(targetDir);

  const localFilePath = path.join(localUploadsDir, fileKey);
  ensureLocalDirectory(path.dirname(localFilePath));

  await fs.promises.writeFile(localFilePath, buffer);

  return {
    fileUrl: `/uploads/${fileKey}`,
    fileKey,
    fileSize: buffer.length,
    storageType: 'local'
  };
};

const getSignedDownloadUrl = async (fileKey, expiresInSeconds = 3600) => {
  if (isR2Configured()) {
    const s3Client = getR2Client();
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey
    });

    return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  }

  return `/uploads/${fileKey}`;
};

const deleteFile = async (fileKey) => {
  if (!fileKey) return;

  if (isR2Configured()) {
    const s3Client = getR2Client();
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey
    });

    await s3Client.send(command);
    return;
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
