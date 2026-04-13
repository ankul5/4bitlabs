const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure the target directory exists
const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'lecture-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid video format. Only MP4, WebM, MOV, and MKV are allowed.'), false);
  }
};

const uploadLocalVideo = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit for local files so it doesn't crash server
  fileFilter: fileFilter
});

module.exports = { uploadLocalVideo };
