const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

// 📌 Place a New Order
exports.placeOrder = async (req, res) => {
  try {
    const { userId, products, paymentMethod, address } = req.body;

    let totalAmount = 0;
    const orderedProducts = [];

    for (let item of products) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: "Product not found!" });

      totalAmount += product.price * item.quantity;
      orderedProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        seller: product.seller,
      });
    }

    const order = new Order({
      user: userId,
      products: orderedProducts,
      totalAmount,
      paymentMethod,
      address,
      sellerAddress: "Auto Fetch from Seller Model",
    });

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// 📌 Get Order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("products.product user");
    if (!order) return res.status(404).json({ message: "Order not found!" });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// 📌 Get Orders of a User
exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).populate("products.product");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Cancel Order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found!" });

    order.orderStatus = "Cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
