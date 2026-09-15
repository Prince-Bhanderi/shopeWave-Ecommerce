import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import asyncHandler from 'express-async-handler';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { uploadsDir } from '../middleware/upload.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';

const streamUploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

const saveLocally = (file) => {
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${randomUUID()}${ext}`;
  fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
  return {
    url: `/uploads/${filename}`,
    publicId: filename,
  };
};

// @desc    Upload one or more product/category images
// @route   POST /api/upload
// @access  Private/Admin
export const uploadImages = asyncHandler(async (req, res) => {
  const files = req.files?.length ? req.files : req.file ? [req.file] : [];

  if (!files.length) {
    throw ApiError.badRequest('No image file(s) provided');
  }

  const folder = req.body.folder === 'categories' ? 'shopwave/categories' : 'shopwave/products';

  const results = await Promise.all(
    files.map(async (file) => {
      if (isCloudinaryConfigured) {
        const result = await streamUploadToCloudinary(file.buffer, folder);
        return { url: result.secure_url, publicId: result.public_id };
      }
      return saveLocally(file);
    })
  );

  sendSuccess(res, 201, 'Image(s) uploaded successfully', results);
});

// @desc    Delete an uploaded image
// @route   DELETE /api/upload
// @access  Private/Admin
export const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) throw ApiError.badRequest('publicId is required');

  if (isCloudinaryConfigured) {
    await cloudinary.uploader.destroy(publicId);
  } else {
    const filePath = path.join(uploadsDir, publicId);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  sendSuccess(res, 200, 'Image deleted successfully');
});
