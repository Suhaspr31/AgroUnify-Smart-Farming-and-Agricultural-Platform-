const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Hash password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate OTP
 */
const generateOTP = (length = 6) => {
  return Math.floor(Math.random() * (10 ** length)).toString().padStart(length, '0');
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateOTP
};
