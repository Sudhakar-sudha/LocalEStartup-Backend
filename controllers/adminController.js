const Product = require("../models/productModel");
const transporter = require('../utils/emailTransporter');
const Order = require("../models/orderModel");
const Payment = require("../models/payment");

exports.approveProduct = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const product = await Product.findById(req.params.id).populate("seller","personalInfo");
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.status = status;
    await product.save();


    await transporter.sendMail({
      to: product.seller.personalInfo.email,
      subject: `Your Product "${product.name}" has been ${status}`,
      html:`Hello, your product "${product.name}" has been ${status} by the admin.`,
    });
    console.log("email send to the admin");
    res.json({ message: `Product ${status} successfully!`, product });
  } catch (error) {
    console.error("Error approving product:", error);
    res.status(500).json({ message: "Error updating product", error });
  }
};

  

exports.getPendingProducts = async (req, res) => {
  try {
    // Populate seller details (name and email)
    const products = await Product.find({ status: "pending" }).populate("seller", "personalInfo");

    if (!products.length) {
      return res.status(404).json({ message: "No pending products found" });
    }

    // Print seller names in the console
    products.forEach(product => {
      console.log(`Seller Name: ${product.seller?.personalInfo.name  || "Unknown Seller"}`);
    });

    res.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "personalInfo.name email"); // Fetch seller details

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.json({ products });
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};



// Controller to get all approved products
exports.getApprovedProducts = async (req, res) => {
    try {
        const approvedProducts = await Product.find({ status: 'approved' });
        res.json(approvedProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('products.product', 'name images')
      .populate('products.seller', 'storeName')
      .populate('deliveryBoy', 'name')
      .sort({ placedAt: -1 });
 console.log(orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// controllers/orderController.js

exports.getOrdersCount = async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();  // Count all orders in the database
    res.status(200).json({ orderCount });
  } catch (error) {
    console.error("Error fetching order count:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('order');
    console.log(payments);
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



// Delete payment by ID
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};