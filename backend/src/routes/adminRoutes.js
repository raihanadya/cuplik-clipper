const express = require('express');
const { getTelemetry } = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/telemetry', authMiddleware, adminMiddleware, getTelemetry);

module.exports = router;
