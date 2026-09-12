const express = require('express');
const { login, forgotPassword, resetPassword, activateUser, deactivateUser } = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Admin routes
router.patch('/admin/users/:user_id/activate', authMiddleware, adminMiddleware, activateUser);
router.patch('/admin/users/:user_id/deactivate', authMiddleware, adminMiddleware, deactivateUser);

module.exports = router;
