const express = require('express');
const { body } = require('express-validator');
const fieldController = require('./field.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { objectIdValidator } = require('../../utils/validators');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Field name is required'),
    body('farm').isMongoId().withMessage('Valid farm ID is required'),
    body('area').isNumeric().withMessage('Area must be a number'),
    validate
  ],
  fieldController.createField
);

router.get('/', fieldController.getAllFields);
router.get('/:id', objectIdValidator('id'), validate, fieldController.getFieldById);
router.put('/:id', objectIdValidator('id'), validate, fieldController.updateField);
router.delete('/:id', objectIdValidator('id'), validate, fieldController.deleteField);

module.exports = router;
