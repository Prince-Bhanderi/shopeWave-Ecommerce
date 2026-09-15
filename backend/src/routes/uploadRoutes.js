import express from 'express';
import { uploadImages, deleteImage } from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, authorize('admin'), upload.array('images', 10), uploadImages);
// publicId (e.g. "shopwave/products/abc123") may contain slashes, so it is
// sent in the request body rather than as a URL param.
router.delete('/', protect, authorize('admin'), deleteImage);

export default router;
