const authController = require('../../../src/controllers/authController');
const User = require('../../../src/models/User');
const mongoose = require('mongoose');

// Mock request and response objects
const mockRequest = (body = {}, params = {}, query = {}, user = null) => ({
  body,
  params,
  query,
  user,
  header: jest.fn()
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller Unit Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = mockRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        phone: '+919876543210',
        role: 'farmer'
      });
      const res = mockResponse();

      // Mock validation result (no errors)
      const { validationResult } = require('express-validator');
      require('express-validator').validationResult = jest.fn().mockReturnValue({
        isEmpty: () => true
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User registered successfully',
          data: expect.objectContaining({
            user: expect.any(Object),
            token: expect.any(String)
          })
        })
      );
    });

    it('should handle validation errors', async () => {
      const req = mockRequest({
        name: '',
        email: 'invalid-email'
      });
      const res = mockResponse();

      // Mock validation result with errors
      require('express-validator').validationResult = jest.fn().mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Name is required' }]
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation errors'
        })
      );
    });

    it('should handle duplicate email error', async () => {
      // Create existing user
      await new User({
        name: 'Existing User',
        email: 'test@example.com',
        password: 'Password123',
        phone: '+919876543210'
      }).save();

      const req = mockRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        phone: '+919876543211'
      });
      const res = mockResponse();

      require('express-validator').validationResult = jest.fn().mockReturnValue({
        isEmpty: () => true
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User with this email already exists'
        })
      );
    });
  });

  describe('login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        phone: '+919876543210'
      });
      await testUser.save();
    });

    it('should login with valid credentials', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'Password123'
      });
      const res = mockResponse();

      require('express-validator').validationResult = jest.fn().mockReturnValue({
        isEmpty: () => true
      });

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
          data: expect.objectContaining({
            user: expect.any(Object),
            token: expect.any(String)
          })
        })
      );
    });

    it('should not login with invalid credentials', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      const res = mockResponse();

      require('express-validator').validationResult = jest.fn().mockReturnValue({
        isEmpty: () => true
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid email or password'
        })
      );
    });
  });

  describe('getProfile', () => {
    it('should get user profile', async () => {
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        phone: '+919876543210'
      });
      await testUser.save();

      const req = mockRequest({}, {}, {}, testUser);
      const res = mockResponse();

      await authController.getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Profile retrieved successfully',
          data: expect.objectContaining({
            user: expect.any(Object)
          })
        })
      );
    });
  });
});