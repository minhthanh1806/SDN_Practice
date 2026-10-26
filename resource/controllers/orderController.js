const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer_id')
      .populate('items.product_id');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer_id')
      .populate('items.product_id');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(404).json({ message: 'Order not found' });
  }
};

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { customer_id, items, payment_method, status, order_date } = req.body;

    // 1. Kiểm tra khách hàng tồn tại
    const customer = await Customer.findById(customer_id);
    if (!customer) {
      return res.status(400).json({ message: 'Customer not found' });
    }

    if (!items || !items.length) {
      return res.status(400).json({ message: 'Items are required' });
    }

    let total_amount = 0;
    const orderItems = [];

    // 2. Kiểm tra từng sản phẩm, tính tiền và trừ tồn kho
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.product_id}` });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({ message: `Requested quantity exceeds available stock for ${product.name}` });
      }

      // Giảm tồn kho
      product.stock -= item.quantity;
      await product.save();

      // Tính tiền tại server
      const itemTotal = item.quantity * product.price;
      total_amount += itemTotal;

      orderItems.push({
        product_id: product._id,
        quantity: item.quantity,
        price_at_order: product.price,
        total: itemTotal
      });
    }

    // 3. Tạo order mới
    const newOrder = await Order.create({
      customer_id,
      items: orderItems,
      total_amount,
      payment_method,
      status,
      order_date: order_date || new Date()
    });

    const populatedOrder = await Order.findById(newOrder._id)
      .populate('customer_id')
      .populate('items.product_id');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/orders/:id
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('customer_id')
      .populate('items.product_id');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};
