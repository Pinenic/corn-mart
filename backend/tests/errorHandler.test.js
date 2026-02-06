import errorHandler from '../middlewares/errorHandler.js';
import notFoundHandler from '../middlewares/notFoundHandler.js';
import AppError from '../utils/AppError.js';

describe('Error handler middleware', () => {
  function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.headersSent = false;
    return res;
  }

  test('handles AppError (operational)', () => {
    const err = new AppError('Not Found', 404, { code: 'NOT_FOUND' });
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'fail',
      statusCode: 404,
      message: 'Not Found',
      code: 'NOT_FOUND'
    }));
  });

  test('masks non-operational error in production', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const err = new Error('unexpected');
    err.isOperational = false;
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'error',
      statusCode: 500,
      message: 'Internal Server Error',
    }));

    process.env.NODE_ENV = prev;
  });

  test('converts MulterError to AppError with INVALID_UPLOAD', () => {
    const multerErr = new Error('File too large');
    multerErr.name = 'MulterError';
    multerErr.code = 'LIMIT_FILE_SIZE';

    const req = {};
    const res = mockRes();
    const next = jest.fn();

    errorHandler(multerErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'INVALID_UPLOAD',
      details: expect.objectContaining({ multerCode: 'LIMIT_FILE_SIZE' }),
    }));
  });
});

describe('notFoundHandler', () => {
  test('forwards AppError with 404', () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    notFoundHandler(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
  });
});
