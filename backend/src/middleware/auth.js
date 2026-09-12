const jwt = require('jsonwebtoken');
const ENV = require('../config/env');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak valid atau expired.' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || !user.is_active) {
      return res.status(403).json({ error: 'Akun tidak aktif. Hubungi admin.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token tidak valid atau expired.' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak. Hanya admin.' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
