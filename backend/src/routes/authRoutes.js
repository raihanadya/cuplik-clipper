const express = require('express');
const { register, login, forgotPassword, resetPassword, activateUser, deactivateUser, deleteAccount } = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// User self-delete
router.delete('/account', authMiddleware, deleteAccount);

// Admin routes
router.patch('/admin/users/:user_id/activate', authMiddleware, adminMiddleware, activateUser);
router.patch('/admin/users/:user_id/deactivate', authMiddleware, adminMiddleware, deactivateUser);

module.exports = router;
