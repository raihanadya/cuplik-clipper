const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendEmail } = require('../services/emailService');
const ENV = require('../config/env');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Akun tidak aktif. Hubungi admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN,
    });

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'Password tidak valid: minimal 8 karakter, harus mengandung huruf kapital, huruf kecil, angka, dan simbol.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email tidak valid.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'user',
    });

    const token = jwt.sign({ id: user._id, role: user.role }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email wajib diisi.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'Jika email terdaftar, link reset password telah dikirim.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PasswordReset.create({ userId: user._id, token, expiresAt });

    const resetLink = `https://frontend.com/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Cuplik - Reset Password',
      html: `<p>Klik link berikut untuk reset password: <a href="${resetLink}">${resetLink}</a></p><p>Link ini berlaku 15 menit.</p>`,
    });

    res.json({ message: 'Jika email terdaftar, link reset password telah dikirim.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      return res.status(400).json({ error: 'Token dan password baru wajib diisi.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(new_password)) {
      return res.status(400).json({
        error: 'Password tidak valid: minimal 8 karakter, harus mengandung huruf kapital, huruf kecil, angka, dan simbol.'
      });
    }

    const resetRecord = await PasswordReset.findOne({ token, used: false });
    if (!resetRecord) {
      return res.status(400).json({ error: 'Token tidak valid atau sudah digunakan.' });
    }

    if (resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Token sudah expired. Silakan request ulang.' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);
    await User.findByIdAndUpdate(resetRecord.userId, { password: hashedPassword });
    resetRecord.used = true;
    await resetRecord.save();

    res.json({ message: 'Password berhasil direset. Silakan login dengan password baru.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.user_id,
      { is_active: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }
    res.json({ message: 'User berhasil diaktifkan.', user: { id: user._id, email: user.email, role: user.role, is_active: user.is_active } });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.user_id,
      { is_active: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }
    res.json({ message: 'User berhasil dinonaktifkan.', user: { id: user._id, email: user.email, role: user.role, is_active: user.is_active } });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password, permanent } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password wajib diisi untuk menghapus akun.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password salah.' });
    }

    if (permanent === true) {
      await User.findByIdAndDelete(req.user._id);
      res.json({ message: 'Akun berhasil dihapus permanen.' });
    } else {
      await User.findByIdAndUpdate(req.user._id, { is_active: false });
      res.json({ message: 'Akun berhasil dinonaktifkan. Hubungi admin untuk mengaktifkan kembali.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'Password tidak valid: minimal 8 karakter, harus mengandung huruf kapital, huruf kecil, angka, dan simbol.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'admin',
    });

    res.status(201).json({
      message: 'Admin berhasil dibuat.',
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Create admin error:', error.message);
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, activateUser, deactivateUser, deleteAccount, createAdmin };
