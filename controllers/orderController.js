const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Seller = require("../models/sellerdataModel"); // Import Seller Model
const Razorpay = require('razorpay');
const Payment = require("../models/payment");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY_SECRET:", process.env.RAZORPAY_SECRET);
 



// // 📌 Get Order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("products.product user");
    if (!order) return res.status(404).json({ message: "Order not found!" });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
      // console.log("hello",razorpay);
    const newPayment = new Payment({
      razorpay_order_id: order.id,
      amount,
      status: "Pending"
    });

    await newPayment.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};




exports.verifyPaymentAndPlaceOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails // includes userId, products, address, paymentMethod, etc.
    } = req.body;

    const { userId, products, paymentMethod, address } = orderDetails;

    // If payment method is COD, skip signature verification
    if (paymentMethod === "COD") {
      return await createOrder(userId, products, paymentMethod, address, null, res);
    }

    // For Razorpay, verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment signature verification failed" });
    }

    // Update payment status
    await Payment.findOneAndUpdate(
      { razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        status: "Completed"
      },
      { new: true }
    );

    // Proceed to order creation
    return await createOrder(userId, products, paymentMethod, address, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    }, res);

  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Failed to process payment" });
  }
};
const createOrder = async (userId, products, paymentMethod, address, paymentInfo, res) => {
  let totalAmount = 0;
  const orderedProducts = [];
  let sellerAddress = "";
  let sellerPhone = "";

  for (let item of products) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ message: "Product not found!" });

    totalAmount += product.price * item.quantity;

    const seller = await Seller.findById(product.seller);
    if (!seller) return res.status(404).json({ message: "Seller not found!" });

    sellerAddress = seller.companyInfo.companyAddress;
    sellerPhone = seller.companyInfo.companyPhone;

    orderedProducts.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
      seller: product.seller
    });
  }

  const order = new Order({
    user: userId,
    products: orderedProducts,
    totalAmount,
    paymentMethod,
    address,
    sellerAddress,
    sellerPhone,
    paymentStatus: paymentMethod === "COD" ? "Pending" : "Completed",
    paymentInfo
  });

  await order.save();
  return res.status(200).json({ message: "Order placed successfully!", order });
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
// 📌 Cancel Order API (Update order status instead of deleting)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found!" });

    // Update order status
    order.orderStatus = "Cancelled";
    await order.save();

    return res.status(200).json({ message: "Order has been cancelled.", order });
  } catch (err) {
    return res.status(500).json({ message: "Server error. Please try again later." });
  } 
};



exports.getOrderCount = async (req, res) => {
  try {
    console.log("Fetching total order count...");

    // Ensure MongoDB is connected before querying
    if (!Order) {
      throw new Error("Order model is not available.");
    }

    const orderCount = await Order.countDocuments();
    console.log("Total Orders:", orderCount);

    res.status(200).json({ count: orderCount });
  } catch (err) {
    console.error("❌ Error fetching order count:", err.message);
    res.status(500).json({ error: `Internal Server Error: ${err.message}` });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    console.log("Fetching all orders...");

    const orders = await Order.find()
      .populate("user", "name email phone") // Populate user details
      .populate({
        path: "products.product",
        select: "name price images", // Ensure images field is selected
      })
      .populate({
        path: "products.seller",
        select: "companyInfo.companyPhone companyInfo.companyAddress", // Fetch seller phone & address
      });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    console.log(`✅ Fetched ${orders.length} orders`);
    res.status(200).json({ orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.params.sellerId; // get seller id from URL

    const orders = await Order.find({ "products.seller": sellerId })
      .populate("user", "name")
      .populate("products.product", "name images")
      .populate("deliveryBoy", "name")
      .sort({ placedAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
}; 


// controllers/orderController.js or similar
exports.getSellerOrdersCount = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    const orderCount = await Order.countDocuments({ "products.seller": sellerId });

    res.status(200).json({ count: orderCount });
  } catch (error) {
    console.error("Error fetching seller order count:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



const mongoose = require("mongoose");

exports.getDeliveredOrders = async (req, res) => {
  try {
    const { deliveryBoyId } = req.query;

    if (!deliveryBoyId) {
      return res.status(400).json({ success: false, message: "deliveryBoyId is required" });
    }

    // Convert to ObjectId to match schema
    const deliveryBoyObjectId = new mongoose.Types.ObjectId(deliveryBoyId);

    const deliveredOrders = await Order.find({
      orderStatus: "Delivered",
      deliveryBoy: deliveryBoyObjectId,
    })
      .populate("user", "name phone")
      .populate("products.product")
      .exec();

    res.status(200).json({ success: true, orders: deliveredOrders });
  } catch (error) {
    console.error("Error fetching delivered orders:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
