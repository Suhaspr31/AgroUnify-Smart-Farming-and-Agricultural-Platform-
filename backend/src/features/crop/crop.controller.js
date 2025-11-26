const cropService = require('./crop.service');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');
const logger = require('../../core/logger');

class CropController {
  async createCrop(req, res) {
    try {
      const cropData = {
        ...req.body,
        farmer: req.user._id
      };
      const crop = await cropService.createCrop(cropData, req.user._id);
      return successResponse(res, crop, 'Crop created successfully', 201);
    } catch (error) {
      logger.error('Create crop error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async getAllCrops(req, res) {
    try {
      const { page = 1, limit = 10, fieldId, stage, isHarvested } = req.query;
      const result = await cropService.getAllCrops(req.user._id, {
        page,
        limit,
        fieldId,
        stage,
        isHarvested
      });

      return paginatedResponse(
        res,
        result.crops,
        page,
        limit,
        result.total,
        'Crops retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all crops error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getCropById(req, res) {
    try {
      const crop = await cropService.getCropById(req.params.id, req.user._id);
      return successResponse(res, crop, 'Crop retrieved successfully');
    } catch (error) {
      logger.error('Get crop by ID error:', error);
      return errorResponse(res, error.message, 404);
    }
  }

  async updateCrop(req, res) {
    try {
      const crop = await cropService.updateCrop(req.params.id, req.user._id, req.body);
      return successResponse(res, crop, 'Crop updated successfully');
    } catch (error) {
      logger.error('Update crop error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteCrop(req, res) {
    try {
      await cropService.deleteCrop(req.params.id, req.user._id);
      return successResponse(res, null, 'Crop deleted successfully');
    } catch (error) {
      logger.error('Delete crop error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async addActivity(req, res) {
    try {
      const crop = await cropService.addActivity(req.params.id, req.user._id, req.body);
      return successResponse(res, crop, 'Activity added successfully');
    } catch (error) {
      logger.error('Add activity error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async getCropStats(req, res) {
    try {
      const stats = await cropService.getCropStats(req.params.id, req.user._id);
      return successResponse(res, stats, 'Crop statistics retrieved successfully');
    } catch (error) {
      logger.error('Get crop stats error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new CropController();
