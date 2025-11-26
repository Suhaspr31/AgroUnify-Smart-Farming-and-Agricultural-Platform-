const fieldService = require('./field.service');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');
const logger = require('../../core/logger');

class FieldController {
  async createField(req, res) {
    try {
      const field = await fieldService.createField(req.body, req.user._id);
      return successResponse(res, field, 'Field created successfully', 201);
    } catch (error) {
      logger.error('Create field error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async getAllFields(req, res) {
    try {
      const { page = 1, limit = 10, farmId } = req.query;
      const result = await fieldService.getAllFields(req.user._id, { page, limit, farmId });
      
      return paginatedResponse(
        res,
        result.fields,
        page,
        limit,
        result.total,
        'Fields retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all fields error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getFieldById(req, res) {
    try {
      const field = await fieldService.getFieldById(req.params.id, req.user._id);
      return successResponse(res, field, 'Field retrieved successfully');
    } catch (error) {
      logger.error('Get field by ID error:', error);
      return errorResponse(res, error.message, 404);
    }
  }

  async updateField(req, res) {
    try {
      const field = await fieldService.updateField(req.params.id, req.user._id, req.body);
      return successResponse(res, field, 'Field updated successfully');
    } catch (error) {
      logger.error('Update field error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteField(req, res) {
    try {
      await fieldService.deleteField(req.params.id, req.user._id);
      return successResponse(res, null, 'Field deleted successfully');
    } catch (error) {
      logger.error('Delete field error:', error);
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new FieldController();
