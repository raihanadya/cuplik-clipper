const { login, forgotPassword, resetPassword } = require('../../src/controllers/authController');

// Mock dependencies
jest.mock('../../src/models/User');
jest.mock('../../src/models/PasswordReset');
jest.mock('../../src/services/emailService');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('crypto');

const User = require('../../src/models/User');
const PasswordReset = require('../../src/models/PasswordReset');
const { sendEmail } = require('../../src/services/emailService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

describe('authController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return 400 if email, password, or role is missing', async () => {
      req.body = { email: 'test@test.com' };
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 401 if user not found', async () => {
      req.body = { email: 'test@test.com', password: '123', role: 'user' };
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 403 if user is inactive', async () => {
      req.body = { email: 'test@test.com', password: '123', role: 'user' };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ is_active: false }),
      });
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 401 if password does not match', async () => {
      req.body = { email: 'test@test.com', password: 'wrong', role: 'user' };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ is_active: true, role: 'user', password: 'hashed' }),
      });
      bcrypt.compare.mockResolvedValue(false);
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return token and user on successful login', async () => {
      req.body = { email: 'test@test.com', password: '123', role: 'user' };
      const mockUser = { _id: 'user1', email: 'test@test.com', role: 'user', is_active: true, password: 'hashed' };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mocktoken');
      await login(req, res);
      expect(res.json).toHaveBeenCalledWith({
        token: 'mocktoken',
        user: { id: 'user1', email: 'test@test.com', role: 'user' },
      });
    });
  });

  describe('forgotPassword', () => {
    it('should return 400 if email is missing', async () => {
      req.body = {};
      await forgotPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return success message even if user not found', async () => {
      req.body = { email: 'nonexistent@test.com' };
      User.findOne.mockResolvedValue(null);
      await forgotPassword(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Jika email terdaftar, link reset password telah dikirim.',
      });
    });

    it('should send email and return success if user exists', async () => {
      req.body = { email: 'test@test.com' };
      User.findOne.mockResolvedValue({ _id: 'user1', email: 'test@test.com' });
      crypto.randomBytes.mockReturnValue({ toString: () => 'mocktoken' });
      PasswordReset.create.mockResolvedValue({});
      sendEmail.mockResolvedValue({});
      await forgotPassword(req, res);
      expect(sendEmail).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Jika email terdaftar, link reset password telah dikirim.',
      });
    });
  });

  describe('resetPassword', () => {
    it('should return 400 if token or new_password is missing', async () => {
      req.body = { token: 'abc' };
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if token not found', async () => {
      req.body = { token: 'invalid', new_password: 'new123' };
      PasswordReset.findOne.mockResolvedValue(null);
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if token is expired', async () => {
      req.body = { token: 'expired', new_password: 'new123' };
      PasswordReset.findOne.mockResolvedValue({
        expiresAt: new Date(Date.now() - 100000),
        used: false,
      });
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should update password and return success on valid token', async () => {
      req.body = { token: 'valid', new_password: 'new123' };
      const mockResetRecord = {
        expiresAt: new Date(Date.now() + 100000),
        used: false,
        userId: 'user1',
        save: jest.fn(),
      };
      PasswordReset.findOne.mockResolvedValue(mockResetRecord);
      bcrypt.hash.mockResolvedValue('hashedpw');
      User.findByIdAndUpdate.mockResolvedValue({});
      await resetPassword(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password berhasil direset. Silakan login dengan password baru.',
      });
    });
  });
});
