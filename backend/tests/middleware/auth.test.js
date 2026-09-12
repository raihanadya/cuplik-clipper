const jwt = require('jsonwebtoken');
const { authMiddleware, adminMiddleware } = require('../../src/middleware/auth');

// Mock User model
jest.mock('../../src/models/User', () => ({
  findById: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

const User = require('../../src/models/User');

describe('auth middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('should return 401 if no Authorization header', async () => {
      await authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token tidak valid atau expired.' });
    });

    it('should return 401 if Authorization header does not start with Bearer', async () => {
      req.headers.authorization = 'InvalidToken';
      await authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });
      await authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 403 if user is not found', async () => {
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 'user123' });
      User.findById.mockResolvedValue(null);
      await authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 403 if user is inactive', async () => {
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 'user123' });
      User.findById.mockResolvedValue({ is_active: false });
      await authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should call next and set req.user for valid token and active user', async () => {
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 'user123' });
      const mockUser = { _id: 'user123', is_active: true, role: 'user' };
      User.findById.mockResolvedValue(mockUser);
      await authMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(mockUser);
    });
  });

  describe('adminMiddleware', () => {
    it('should return 403 if user role is not admin', () => {
      req.user = { role: 'user' };
      adminMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should call next if user role is admin', () => {
      req.user = { role: 'admin' };
      adminMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
