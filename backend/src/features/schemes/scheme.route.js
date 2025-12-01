const express = require('express');
const router = express.Router();
const schemeService = require('./scheme.service');

// Get all schemes
router.get('/', async (req, res) => {
  try {
    const { category, state, status } = req.query;
    const result = await schemeService.getAllSchemes({ category, state, status });

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get scheme by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await schemeService.getSchemeById(req.params.id);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get eligible schemes for farmer
router.get('/eligible', async (req, res) => {
  try {
    // In a real app, this would use authenticated user data
    const result = await schemeService.getEligibleSchemes();

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Apply for a scheme
router.post('/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const applicationData = req.body;

    // Basic validation
    const requiredFields = ['farmerName', 'aadhaarNumber', 'phoneNumber', 'address', 'landArea'];
    const missingFields = requiredFields.filter(field => !applicationData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate Aadhaar number format
    if (!/^\d{12}$/.test(applicationData.aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number format'
      });
    }

    const result = await schemeService.applyForScheme(id, applicationData);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get applications (for a farmer)
router.get('/applications', async (req, res) => {
  try {
    const { aadhaarNumber, status, schemeId } = req.query;
    const result = await schemeService.getApplications({ aadhaarNumber, status, schemeId });

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        count: result.data.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get application by ID
router.get('/applications/:id', async (req, res) => {
  try {
    const result = await schemeService.getApplicationById(req.params.id);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update application status (admin endpoint)
router.put('/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const result = await schemeService.updateApplicationStatus(id, status, remarks);

    if (result.success) {
      res.json({
        success: true,
        message: 'Application status updated successfully',
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;