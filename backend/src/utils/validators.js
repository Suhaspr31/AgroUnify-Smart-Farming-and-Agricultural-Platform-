const { body, param, query } = require('express-validator');

/**
 * Email validator
 */
const emailValidator = () => 
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email');

/**
 * Password validator
 */
const passwordValidator = () =>
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long');

/**
 * Phone validator
 */
const phoneValidator = () =>
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number');

/**
 * MongoDB ObjectId validator
 */
const objectIdValidator = (field = 'id') =>
  param(field)
    .isMongoId()
    .withMessage('Invalid ID format');

/**
 * Pagination validators
 */
const paginationValidators = () => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  emailValidator,
  passwordValidator,
  phoneValidator,
  objectIdValidator,
  paginationValidators
};
