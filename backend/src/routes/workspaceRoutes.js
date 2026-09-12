const express = require('express');
const { upload, uploadVideo, getStatus, getClips } = require('../controllers/workspaceController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('file'), uploadVideo);
router.get('/session/:session_id/status', authMiddleware, getStatus);
router.get('/session/:session_id/clips', authMiddleware, getClips);

module.exports = router;
