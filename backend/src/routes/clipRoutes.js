const express = require('express');
const { rerender, downloadMp4, downloadSrt } = require('../controllers/clipController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/:clip_id/rerender', authMiddleware, rerender);
router.get('/:clip_id/download/mp4', authMiddleware, downloadMp4);
router.get('/:clip_id/download/srt', authMiddleware, downloadSrt);

module.exports = router;
