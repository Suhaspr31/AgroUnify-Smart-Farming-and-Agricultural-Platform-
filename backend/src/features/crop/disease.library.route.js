const express = require('express');
const router = express.Router();
const diseaseLibraryController = require('./disease.library.controller');
const { authenticate } = require('../../middleware/auth');

// Public routes (no authentication required)
router.get('/stats', diseaseLibraryController.getDiseaseStats);
router.get('/search/symptoms', diseaseLibraryController.searchBySymptoms);

// Routes that require authentication
router.use(authenticate);

// Get disease by key
router.get('/:diseaseKey', diseaseLibraryController.getDiseaseByKey);

// Get disease by name and crop type
router.get('/name/:diseaseName/crop/:cropType', diseaseLibraryController.getDiseaseByName);

// Get all diseases for a crop
router.get('/crop/:cropType', diseaseLibraryController.getDiseasesByCrop);

// Get diseases by pathogen type
router.get('/pathogen/:pathogenType', diseaseLibraryController.getDiseasesByPathogenType);

// Get all diseases with pagination
router.get('/', diseaseLibraryController.getAllDiseases);

// Add new disease (admin only - you might want to add role checking)
router.post('/', diseaseLibraryController.addDisease);

// Update disease (admin only)
router.put('/:diseaseKey', diseaseLibraryController.updateDisease);

// Delete disease (admin only)
router.delete('/:diseaseKey', diseaseLibraryController.deleteDisease);

module.exports = router;