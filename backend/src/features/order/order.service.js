const Order = require('./order.model');
const Product = require('../product/product.model');
const emailService = require('../../core/emailService');
const logger = require('../../core/logger');

class OrderService {
  async createOrder(orderData) {
    const { items, shippingAddress, paymentMethod, notes } = orderData;

    // Calculate totals and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        throw new Error(`Product ${item.product} not found`);
      }

      if (!product.isActive) {
        throw new Error(`Product ${product.name} is not available`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        subtotal
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      customer: orderData.customer,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes,
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order created'
      }]
    });

    // Populate order details
    await order.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'items.product', select: 'name price images' }
    ]);

    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmationEmail(order.customer, order);
    } catch (error) {
      logger.error('Failed to send order confirmation email:', error);
    }

    return order;
  }

  async getAllOrders(userId, { page = 1, limit = 10, status }) {
    const skip = (page - 1) * limit;
    const query = { customer: userId };

    if (status) {
      query.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.product', 'name price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);

    return { orders, total };
  }

  async getAllOrdersAdmin({ page = 1, limit = 10, status, search }) {
    const skip = (page - 1) * limit;
    const query = {};

    if (status) {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name email phone')
        .populate('items.product', 'name price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);

    return { orders, total };
  }

  async getOrderById(orderId, userId, userRole) {
    const order = await Order.findById(orderId)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price images vendor');

    if (!order) {
      throw new Error('Order not found');
    }

    // Check permission
    if (userRole !== 'admin' && order.customer._id.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }

    return order;
  }

  async updateOrderStatus(orderId, status, note) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };

    if (!validTransitions[order.orderStatus].includes(status)) {
      throw new Error(`Cannot change status from ${order.orderStatus} to ${status}`);
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note
    });

    if (status === 'delivered') {
      order.deliveryDate = new Date();
      order.paymentStatus = 'completed';
    }

    await order.save();

    return order.populate([
      { path: 'customer', select: 'name email' },
      { path: 'items.product', select: 'name price' }
    ]);
  }

  async cancelOrder(orderId, userId, reason) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Check permission
    if (order.customer.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      throw new Error(`Cannot cancel order with status: ${order.orderStatus}`);
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason || 'Cancelled by customer'
    });

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await order.save();

    return order;
  }

  async updatePaymentStatus(orderId, paymentStatus, transactionId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.paymentStatus = paymentStatus;
    
    if (transactionId) {
      order.paymentDetails = {
        ...order.paymentDetails,
        transactionId,
        paymentDate: new Date()
      };
    }

    await order.save();

    return order;
  }
}

module.exports = new OrderService();
