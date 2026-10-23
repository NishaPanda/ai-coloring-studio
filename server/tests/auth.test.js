import { describe, it } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { registerUser, loginUser } from '../controllers/authController.js';

// Helper to create mock response object
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

describe('Authentication Controller Tests', () => {

  // ─── Register User Tests ───────────────────────────────────────────────────
  describe('registerUser', () => {
    it('should return 400 if any required field is missing', async () => {
      const req = { body: { username: 'testuser', email: '' } };
      const res = createMockRes();
      const next = (err) => { throw err; };

      await registerUser(req, res, next);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Please add all fields');
    });

    it('should return 400 if user with email already exists', async (t) => {
      // Mock User.findOne to simulate existing user
      t.mock.method(User, 'findOne', async () => ({
        _id: 'existing_id_123',
        email: 'existing@example.com',
      }));

      const req = {
        body: {
          username: 'newuser',
          email: 'existing@example.com',
          password: 'Password123!',
        },
      };
      const res = createMockRes();
      const next = (err) => { throw err; };

      await registerUser(req, res, next);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'User already exists');
    });

    it('should create user, hash password, and return 201 with sanitized user info', async (t) => {
      // Mock User.findOne to return null (no duplicate)
      t.mock.method(User, 'findOne', async () => null);

      let createdWithData = null;
      t.mock.method(User, 'create', async (data) => {
        createdWithData = data;
        return {
          _id: 'mock_user_id_456',
          username: data.username,
          email: data.email,
        };
      });

      const rawPassword = 'SecurePassword789!';
      const req = {
        body: {
          username: 'artlover',
          email: 'artlover@example.com',
          password: rawPassword,
        },
      };
      const res = createMockRes();
      const next = (err) => { throw err; };

      await registerUser(req, res, next);

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.user.username, 'artlover');
      assert.strictEqual(res.data.user.email, 'artlover@example.com');
      assert.strictEqual(res.data.user._id, 'mock_user_id_456');

      // Verify that the password was hashed with bcrypt (NOT stored as plain text)
      assert.notStrictEqual(createdWithData.password, rawPassword);
      const isHashed = await bcrypt.compare(rawPassword, createdWithData.password);
      assert.strictEqual(isHashed, true);

      // Verify password is NOT included in the response (sanitized)
      assert.strictEqual(res.data.user.password, undefined);
    });
  });

  // ─── Login User Tests ──────────────────────────────────────────────────────
  describe('loginUser', () => {
    it('should return 400 if email or password is missing', async () => {
      const req = { body: { email: 'user@example.com', password: '' } };
      const res = createMockRes();
      const next = (err) => { throw err; };

      await loginUser(req, res, next);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Please add email and password');
    });

    it('should return 401 if user does not exist', async (t) => {
      t.mock.method(User, 'findOne', async () => null);

      const req = {
        body: {
          email: 'unknown@example.com',
          password: 'Password123',
        },
      };
      const res = createMockRes();
      const next = (err) => { throw err; };

      await loginUser(req, res, next);

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Invalid credentials');
    });

    it('should return 401 if password does not match', async (t) => {
      const hashedPassword = await bcrypt.hash('CorrectPassword', 10);
      t.mock.method(User, 'findOne', async () => ({
        _id: 'user_123',
        email: 'user@example.com',
        password: hashedPassword,
      }));

      const req = {
        body: {
          email: 'user@example.com',
          password: 'WrongPassword',
        },
      };
      const res = createMockRes();
      const next = (err) => { throw err; };

      await loginUser(req, res, next);

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Invalid credentials');
    });

    it('should return 200 with JWT token and sanitized user on successful login', async (t) => {
      process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
      const rawPassword = 'CorrectPassword';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      t.mock.method(User, 'findOne', async () => ({
        _id: 'user_123',
        username: 'picasso',
        email: 'picasso@example.com',
        password: hashedPassword,
      }));

      const req = {
        body: {
          email: 'picasso@example.com',
          password: rawPassword,
        },
      };
      const res = createMockRes();
      const next = (err) => { throw err; };

      await loginUser(req, res, next);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(typeof res.data.token, 'string');
      assert.ok(res.data.token.length > 20);
      assert.strictEqual(res.data.user.username, 'picasso');
      assert.strictEqual(res.data.user.password, undefined);
    });
  });

});
