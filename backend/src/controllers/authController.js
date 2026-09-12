const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendEmail } = require('../services/emailService');
const ENV = require('../config/env');

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, dan role wajib diisi.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Akun tidak aktif. Hubungi admin.' });
    }

    if (user.role !== role) {
      return res.status(403).json({ error: 'Role tidak sesuai.' });
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

module.exports = { login, forgotPassword, resetPassword, activateUser, deactivateUser };
