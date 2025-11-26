const productService = require('./product.service');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');
const logger = require('../../core/logger');

class ProductController {
  async createProduct(req, res) {
    try {
      const productData = {
        ...req.body,
        vendor: req.user._id,
        images: req.files ? req.files.map(file => file.filename) : []
      };

      const product = await productService.createProduct(productData);
      return successResponse(res, product, 'Product created successfully', 201);
    } catch (error) {
      logger.error('Create product error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async getAllProducts(req, res) {
    try {
      const { page = 1, limit = 12, category, search, minPrice, maxPrice, sort } = req.query;
      const result = await productService.getAllProducts({
        page,
        limit,
        category,
        search,
        minPrice,
        maxPrice,
        sort
      });

      return paginatedResponse(
        res,
        result.products,
        page,
        limit,
        result.total,
        'Products retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all products error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getProductById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      return successResponse(res, product, 'Product retrieved successfully');
    } catch (error) {
      logger.error('Get product by ID error:', error);
      return errorResponse(res, error.message, 404);
    }
  }

  async updateProduct(req, res) {
    try {
      const updateData = {
        ...req.body,
        ...(req.files && req.files.length > 0 && {
          images: req.files.map(file => file.filename)
        })
      };

      const product = await productService.updateProduct(
        req.params.id,
        req.user._id,
        req.user.role,
        updateData
      );
      return successResponse(res, product, 'Product updated successfully');
    } catch (error) {
      logger.error('Update product error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.params.id, req.user._id, req.user.role);
      return successResponse(res, null, 'Product deleted successfully');
    } catch (error) {
      logger.error('Delete product error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async addReview(req, res) {
    try {
      const reviewData = {
        ...req.body,
        user: req.user._id
      };

      const product = await productService.addReview(req.params.id, reviewData);
      return successResponse(res, product, 'Review added successfully');
    } catch (error) {
      logger.error('Add review error:', error);
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new ProductController();
