// backend/routes/cropAnalysis.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `crop_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// AI Service Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:7000';

/**
 * POST /api/crop-analysis/analyze
 * Upload crop image and get AI analysis
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    console.log('\n=== Crop Analysis Request ===');

    // Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded'
      });
    }

    console.log(`[OK] File received: ${req.file.originalname}`);
    console.log(`  Size: ${req.file.size} bytes`);
    console.log(`  Type: ${req.file.mimetype}`);

    // Get parameters
    const language = req.body.language || 'English';
    const format = req.query.format || 'pdf';
    const userId = req.user?.id; // From auth middleware if available

    console.log(`[OK] Language: ${language}, Format: ${format}`);

    // Prepare form data for AI service
    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    formData.append('language', language);

    console.log('Calling AI service...');

    // Call Python AI service
    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/analyze?format=${format}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        responseType: format === 'json' ? 'json' : 'arraybuffer',
        timeout: 60000, // 60 second timeout
        maxContentLength: 50 * 1024 * 1024, // 50MB
        maxBodyLength: 50 * 1024 * 1024
      }
    );

    console.log('[OK] AI service response received');

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    // Get PDF buffer from AI response
    const pdfBuffer = Buffer.from(aiResponse.data);
    const pdfFilename = `crop_analysis_${Date.now()}.pdf`;
    const pdfFilePath = path.join(reportsDir, pdfFilename);

    // Save PDF to reports directory
    try {
      fs.writeFileSync(pdfFilePath, pdfBuffer);
      console.log(`[OK] PDF saved to: ${pdfFilePath}`);
    } catch (saveError) {
      console.error('Error saving PDF file:', saveError);
      // Continue with response even if save fails
    }

    // Handle JSON response
    if (format === 'json') {
      // Transform AI service response to match frontend expectations
      const aiData = aiResponse.data;

      console.log('[OK] JSON response ready with download URL:', `/api/v1/crop-analysis/reports/${pdfFilename}`);

      // Create structured response similar to CropDoctor format
      const structuredResponse = {
        success: true,
        analysisData: {
          crop_analysis: {
            disease: aiData.analysis || 'Analysis Complete',
            crop_type: 'Unknown', // AI service doesn't provide this
            disease_severity_percent: 0,
            confidence_scores: {
              disease: 0.95
            },
            predicted_yield: 0,
            fertilizer_recommendation: 'See PDF Report',
            fertilizer_dose: 'See PDF Report',
            pesticide_recommendation: 'See PDF Report',
            pesticide_dose: 'See PDF Report',
            irrigation_advice: 'See PDF Report',
            prevention_strategies: ['See PDF Report'],
            growth_stage_tips: ['See PDF Report']
          },
          geminiAnalysis: {
            cropType: 'Unknown',
            diseaseIdentification: {
              name: aiData.analysis || 'Analysis Complete',
              confidenceScore: 0.95
            },
            severityAssessment: {
              percentageAffected: 0,
              level: 'Complete'
            },
            yieldPrediction: {
              forecastAnalysis: 'See PDF Report',
              confidenceScore: 0.8
            },
            treatmentRecommendations: {
              fertilizerSuggestions: 'See PDF Report',
              pesticideRecommendations: {
                chemical: 'See PDF Report'
              },
              safetyPrecautions: 'See PDF Report'
            },
            smartFarmingRecommendations: {
              irrigationAdvice: 'See PDF Report',
              preventionStrategies: 'See PDF Report',
              culturalPractices: 'See PDF Report'
            }
          }
        },
        pdfFilename: pdfFilename,
        downloadUrl: `/api/v1/crop-analysis/reports/${pdfFilename}`,
        filename: req.file.originalname,
        uploadedAt: new Date().toISOString()
      };

      return res.json(structuredResponse);
    }

    // Handle PDF response - send the buffer directly
    console.log(`[OK] PDF generated: ${pdfBuffer.length} bytes`);
    console.log('=== Request Complete ===\n');

    // Set headers for PDF download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfFilename}"`,
      'Content-Length': pdfBuffer.length
    });

    return res.send(pdfBuffer);

  } catch (error) {
    console.error('\n[ERROR] Error in crop analysis:');
    console.error(error.message);

    // Clean up file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    }

    // Check if AI service is unreachable
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'AI service is currently unavailable. Please try again later.',
        details: 'Cannot connect to crop analysis service'
      });
    }

    // Timeout error
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Analysis timed out. Please try again with a smaller image.',
        details: 'Request timeout'
      });
    }

    // AI service error
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data?.error || 'AI service error',
        details: error.response.data
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze crop image',
      details: error.message
    });
  }
});

/**
 * GET /api/crop-analysis/health
 * Check AI service health
 */
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000
    });

    return res.json({
      success: true,
      aiService: response.data,
      backend: {
        status: 'ok',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      error: 'AI service unavailable',
      backend: {
        status: 'ok',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/crop-analysis/languages
 * Get supported languages
 */
router.get('/languages', (req, res) => {
  res.json({
    success: true,
    languages: [
      { code: 'en', name: 'English', native: 'English' },
      { code: 'hi', name: 'Hindi', native: 'हिंदी' },
      { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
      { code: 'te', name: 'Telugu', native: 'తెలుగు' }
    ]
  });
});

/**
 * GET /api/crop-analysis/reports/:filename
 * Serve PDF reports
 */
router.get('/reports/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(reportsDir, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'Report not found'
    });
  }

  // Set headers for PDF download
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`
  });

  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  fileStream.on('error', (error) => {
    console.error('Error streaming PDF file:', error);
    res.status(500).json({
      success: false,
      error: 'Error serving report'
    });
  });
});

module.exports = router;