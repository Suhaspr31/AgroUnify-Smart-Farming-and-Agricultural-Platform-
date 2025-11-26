const farmService = require('./farm.service');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');
const logger = require('../../core/logger');

class FarmController {
  async createFarm(req, res) {
    try {
      const farmData = {
        ...req.body,
        owner: req.user._id,
        images: req.files ? req.files.map(file => file.filename) : []
      };

      const farm = await farmService.createFarm(farmData);
      return successResponse(res, farm, 'Farm created successfully', 201);
    } catch (error) {
      logger.error('Create farm error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async getAllFarms(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await farmService.getAllFarms(req.user._id, { page, limit });
      
      return paginatedResponse(
        res,
        result.farms,
        page,
        limit,
        result.total,
        'Farms retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all farms error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getFarmById(req, res) {
    try {
      const farm = await farmService.getFarmById(req.params.id, req.user._id);
      return successResponse(res, farm, 'Farm retrieved successfully');
    } catch (error) {
      logger.error('Get farm by ID error:', error);
      return errorResponse(res, error.message, 404);
    }
  }

  async updateFarm(req, res) {
    try {
      const updateData = {
        ...req.body,
        ...(req.files && req.files.length > 0 && {
          images: req.files.map(file => file.filename)
        })
      };

      const farm = await farmService.updateFarm(req.params.id, req.user._id, updateData);
      return successResponse(res, farm, 'Farm updated successfully');
    } catch (error) {
      logger.error('Update farm error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteFarm(req, res) {
    try {
      await farmService.deleteFarm(req.params.id, req.user._id);
      return successResponse(res, null, 'Farm deleted successfully');
    } catch (error) {
      logger.error('Delete farm error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async getFarmStats(req, res) {
    try {
      const stats = await farmService.getFarmStats(req.params.id, req.user._id);
      return successResponse(res, stats, 'Farm statistics retrieved successfully');
    } catch (error) {
      logger.error('Get farm stats error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new FarmController();
