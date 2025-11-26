const orderService = require('./order.service');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');
const logger = require('../../core/logger');

class OrderController {
  async createOrder(req, res) {
    try {
      const orderData = {
        ...req.body,
        customer: req.user._id
      };

      const order = await orderService.createOrder(orderData);
      return successResponse(res, order, 'Order created successfully', 201);
    } catch (error) {
      logger.error('Create order error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async getAllOrders(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const result = await orderService.getAllOrders(req.user._id, { page, limit, status });

      return paginatedResponse(
        res,
        result.orders,
        page,
        limit,
        result.total,
        'Orders retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all orders error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getAllOrdersAdmin(req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const result = await orderService.getAllOrdersAdmin({ page, limit, status, search });

      return paginatedResponse(
        res,
        result.orders,
        page,
        limit,
        result.total,
        'Orders retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all orders (admin) error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async getOrderById(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role);
      return successResponse(res, order, 'Order retrieved successfully');
    } catch (error) {
      logger.error('Get order by ID error:', error);
      return errorResponse(res, error.message, 404);
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { status, note } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, status, note);
      return successResponse(res, order, 'Order status updated successfully');
    } catch (error) {
      logger.error('Update order status error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async cancelOrder(req, res) {
    try {
      const { reason } = req.body;
      const order = await orderService.cancelOrder(req.params.id, req.user._id, reason);
      return successResponse(res, order, 'Order cancelled successfully');
    } catch (error) {
      logger.error('Cancel order error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async updatePaymentStatus(req, res) {
    try {
      const { paymentStatus, transactionId } = req.body;
      const order = await orderService.updatePaymentStatus(
        req.params.id,
        paymentStatus,
        transactionId
      );
      return successResponse(res, order, 'Payment status updated successfully');
    } catch (error) {
      logger.error('Update payment status error:', error);
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new OrderController();
