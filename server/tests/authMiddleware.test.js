import { describe, it } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
}

describe('Auth Middleware (protect)', () => {

  it('should return 401 if authorization header is missing', async () => {
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;

    await protect(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.message, 'Not authorized, no token');
    assert.strictEqual(nextCalled, false);
  });

  it('should return 401 if authorization header does not start with Bearer', async () => {
    const req = { headers: { authorization: 'Basic 123456' } };
    const res = createMockRes();
    let nextCalled = false;

    await protect(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.message, 'Not authorized, no token');
    assert.strictEqual(nextCalled, false);
  });

  it('should return 401 if token is invalid or expired', async () => {
    process.env.JWT_SECRET = 'test_secret_for_middleware_123';
    const req = { headers: { authorization: 'Bearer invalid.token.value' } };
    const res = createMockRes();
    let nextCalled = false;

    await protect(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.message, 'Not authorized, token failed');
    assert.strictEqual(nextCalled, false);
  });

  it('should attach req.user and call next() on valid token', async (t) => {
    process.env.JWT_SECRET = 'test_secret_for_middleware_123';
    const mockUserId = '507f1f77bcf86cd799439011';
    const validToken = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET);

    // Mock User.findById(...).select('-password')
    t.mock.method(User, 'findById', () => ({
      select: async (fields) => {
        assert.strictEqual(fields, '-password');
        return {
          _id: mockUserId,
          username: 'validuser',
          email: 'valid@example.com',
        };
      },
    }));

    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = createMockRes();
    let nextCalled = false;

    await protect(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.ok(req.user);
    assert.strictEqual(req.user.username, 'validuser');
    assert.strictEqual(req.user._id, mockUserId);
    assert.strictEqual(res.data, null); // json() was never called
  });

});
