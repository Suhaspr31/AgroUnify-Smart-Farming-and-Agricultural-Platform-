const express = require('express');
const { body } = require('express-validator');
const cropController = require('./crop.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { objectIdValidator } = require('../../utils/validators');

const router = express.Router();

router.use(authenticate);

// Create crop
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Crop name is required'),
    body('field').isMongoId().withMessage('Valid field ID is required'),
    body('plantingDate').isISO8601().withMessage('Valid planting date is required'),
    validate
  ],
  cropController.createCrop
);

// Get all crops
router.get('/', cropController.getAllCrops);

// Get crop by ID
router.get('/:id', objectIdValidator('id'), validate, cropController.getCropById);

// Update crop
router.put('/:id', objectIdValidator('id'), validate, cropController.updateCrop);

// Delete crop
router.delete('/:id', objectIdValidator('id'), validate, cropController.deleteCrop);

// Add activity to crop
router.post(
  '/:id/activities',
  objectIdValidator('id'),
  [
    body('type').isIn(['irrigation', 'fertilization', 'pesticide', 'weeding', 'monitoring']),
    body('description').optional().trim(),
    body('date').isISO8601(),
    validate
  ],
  cropController.addActivity
);

// Get crop statistics
router.get('/:id/stats', objectIdValidator('id'), validate, cropController.getCropStats);

module.exports = router;
