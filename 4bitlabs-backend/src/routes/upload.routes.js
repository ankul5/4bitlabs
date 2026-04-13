const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadImage, uploadVideo, uploadDocument } = require('../config/cloudinary');
const { uploadLocalVideo } = require('../config/uploadLocal');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const router = express.Router();

// POST /api/v1/upload/image    — Upload image (avatar, thumbnail)
router.post('/image', protect, uploadImage.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json(errorResponse('No file uploaded.'));
  res.json(successResponse('Image uploaded.', {
    url: req.file.path,
    publicId: req.file.filename,
  }));
});

// POST /api/v1/upload/video    — Upload recorded lecture video (teacher/admin only)
router.post(
  '/video',
  protect,
  authorize('teacher', 'school_admin', 'super_admin', 'mentor'),
  uploadLocalVideo.single('file'),
  (req, res) => {
    if (!req.file) return res.status(400).json(errorResponse('No file uploaded.'));
    // The file is saved at public/uploads/videos/...
    // Determine base URL dynamically or use relative path `/uploads/videos/filename`
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/videos/${req.file.filename}`;
    
    res.json(successResponse('Video uploaded successfully locally.', {
      url: fileUrl,
      publicId: req.file.filename,
      duration: req.file.duration || null,
      localPath: `/uploads/videos/${req.file.filename}`, // useful for relative db storage
    }));
  }
);

// POST /api/v1/upload/document — Upload PDF/doc/zip (teacher/admin only)
router.post(
  '/document',
  protect,
  authorize('teacher', 'school_admin', 'super_admin'),
  uploadDocument.single('file'),
  (req, res) => {
    if (!req.file) return res.status(400).json(errorResponse('No file uploaded.'));
    res.json(successResponse('Document uploaded.', {
      url: req.file.path,
      publicId: req.file.filename,
    }));
  }
);

module.exports = router;
