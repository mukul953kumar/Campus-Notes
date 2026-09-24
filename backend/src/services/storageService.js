const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { isR2Configured, getR2Client } = require('../config/r2');
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
  const fileKey = `${folder}/${uniquePrefix}-${safeName}`;

  // 1. Cloudinary Storage (Free 25 GB No Card Required)
  if (isCloudinaryConfigured()) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: `campus-notes/${folder}`,
            public_id: `${uniquePrefix}-${safeName}`
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
    } catch (error) {
      console.error('[Cloudinary Upload Error]', error.message);
      // Fall through to other storage if cloudinary failed
    }
  }

  // 2. Cloudflare R2 Storage (S3-compatible)
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

  // 3. Local fallback storage
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
  if (fileKey && (fileKey.startsWith('http://') || fileKey.startsWith('https://'))) {
    return fileKey;
  }

  if (isCloudinaryConfigured()) {
    return cloudinary.url(fileKey, { resource_type: 'raw', secure: true });
  }

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

  if (isCloudinaryConfigured()) {
    try {
      await cloudinary.uploader.destroy(fileKey, { resource_type: 'raw' });
      return;
    } catch (err) {
      console.error('[Cloudinary Delete Error]', err.message);
    }
  }

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
