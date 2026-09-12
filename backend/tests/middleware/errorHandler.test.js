const errorHandler = require('../../src/middleware/errorHandler');

describe('errorHandler middleware', () => {
  let req, res, next, consoleSpy;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should handle file size limit error', () => {
    const err = { code: 'LIMIT_FILE_SIZE' };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Ukuran file melebihi 1GB.' });
  });

  it('should handle MulterError', () => {
    const err = { name: 'MulterError', message: 'Unexpected field' };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Upload error: Unexpected field' });
  });

  it('should handle CastError', () => {
    const err = { name: 'CastError' };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'ID tidak valid.' });
  });

  it('should handle generic errors with 500', () => {
    const err = new Error('Something went wrong');
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Terjadi kesalahan server. Silakan coba lagi.' });
  });
});
