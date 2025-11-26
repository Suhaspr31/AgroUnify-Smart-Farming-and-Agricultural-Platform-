const express = require('express');
const { body } = require('express-validator');
const farmController = require('./farm.controller');
const { authenticate } = require('../../middleware/auth');
const upload = require('../../config/multer');
const validate = require('../../middleware/validation');
const { objectIdValidator } = require('../../utils/validators');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create farm
router.post(
  '/',
  upload.array('images', 5),
  [
    body('name').trim().notEmpty().withMessage('Farm name is required'),
    body('totalArea').isNumeric().withMessage('Total area must be a number'),
    body('soilType').isIn(['clay', 'sandy', 'loamy', 'black', 'red', 'alluvial', 'laterite']).withMessage('Invalid soil type'),
    body('irrigationType').isIn(['drip', 'sprinkler', 'flood', 'furrow', 'rainfed']).withMessage('Invalid irrigation type'),
    validate
  ],
  farmController.createFarm
);

// Get all farms (user's farms)
router.get('/', farmController.getAllFarms);

// Get farm by ID
router.get('/:id', objectIdValidator('id'), validate, farmController.getFarmById);

// Update farm
router.put(
  '/:id',
  upload.array('images', 5),
  objectIdValidator('id'),
  validate,
  farmController.updateFarm
);

// Delete farm
router.delete('/:id', objectIdValidator('id'), validate, farmController.deleteFarm);

// Get farm statistics
router.get('/:id/stats', objectIdValidator('id'), validate, farmController.getFarmStats);

module.exports = router;
