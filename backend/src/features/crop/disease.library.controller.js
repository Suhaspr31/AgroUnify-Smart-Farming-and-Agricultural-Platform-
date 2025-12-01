const diseaseLibraryService = require('./disease.library.service');

class DiseaseLibraryController {
  // Get disease by key
  async getDiseaseByKey(req, res) {
    try {
      const { diseaseKey } = req.params;
      const disease = await diseaseLibraryService.getDiseaseByKey(diseaseKey);

      if (!disease) {
        return res.status(404).json({
          success: false,
          message: 'Disease not found in library'
        });
      }

      res.json({
        success: true,
        data: disease
      });
    } catch (error) {
      console.error('Error in getDiseaseByKey:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get disease by name and crop type
  async getDiseaseByName(req, res) {
    try {
      const { diseaseName, cropType } = req.params;
      const disease = await diseaseLibraryService.getDiseaseByName(diseaseName, cropType);

      if (!disease) {
        return res.status(404).json({
          success: false,
          message: 'Disease not found for specified crop'
        });
      }

      res.json({
        success: true,
        data: disease
      });
    } catch (error) {
      console.error('Error in getDiseaseByName:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all diseases for a crop
  async getDiseasesByCrop(req, res) {
    try {
      const { cropType } = req.params;
      const diseases = await diseaseLibraryService.getDiseasesByCrop(cropType);

      res.json({
        success: true,
        data: diseases,
        count: diseases.length
      });
    } catch (error) {
      console.error('Error in getDiseasesByCrop:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Search diseases by symptoms
  async searchBySymptoms(req, res) {
    try {
      const { symptoms } = req.body; // Array of symptoms

      if (!symptoms || !Array.isArray(symptoms)) {
        return res.status(400).json({
          success: false,
          message: 'Symptoms array is required'
        });
      }

      const diseases = await diseaseLibraryService.searchBySymptoms(symptoms);

      res.json({
        success: true,
        data: diseases,
        count: diseases.length
      });
    } catch (error) {
      console.error('Error in searchBySymptoms:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get diseases by pathogen type
  async getDiseasesByPathogenType(req, res) {
    try {
      const { pathogenType } = req.params;
      const diseases = await diseaseLibraryService.getDiseasesByPathogenType(pathogenType);

      res.json({
        success: true,
        data: diseases,
        count: diseases.length
      });
    } catch (error) {
      console.error('Error in getDiseasesByPathogenType:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Add new disease
  async addDisease(req, res) {
    try {
      const diseaseData = req.body;
      const disease = await diseaseLibraryService.addDisease(diseaseData);

      res.status(201).json({
        success: true,
        message: 'Disease added to library successfully',
        data: disease
      });
    } catch (error) {
      console.error('Error in addDisease:', error);

      if (error.code === 11000) { // Duplicate key error
        return res.status(409).json({
          success: false,
          message: 'Disease with this key already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update disease
  async updateDisease(req, res) {
    try {
      const { diseaseKey } = req.params;
      const updateData = req.body;

      const disease = await diseaseLibraryService.updateDisease(diseaseKey, updateData);

      if (!disease) {
        return res.status(404).json({
          success: false,
          message: 'Disease not found'
        });
      }

      res.json({
        success: true,
        message: 'Disease updated successfully',
        data: disease
      });
    } catch (error) {
      console.error('Error in updateDisease:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete disease
  async deleteDisease(req, res) {
    try {
      const { diseaseKey } = req.params;
      const disease = await diseaseLibraryService.deleteDisease(diseaseKey);

      if (!disease) {
        return res.status(404).json({
          success: false,
          message: 'Disease not found'
        });
      }

      res.json({
        success: true,
        message: 'Disease deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteDisease:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all diseases with pagination
  async getAllDiseases(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await diseaseLibraryService.getAllDiseases(page, limit);

      res.json({
        success: true,
        data: result.diseases,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in getAllDiseases:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get disease statistics
  async getDiseaseStats(req, res) {
    try {
      const stats = await diseaseLibraryService.getDiseaseStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getDiseaseStats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new DiseaseLibraryController();