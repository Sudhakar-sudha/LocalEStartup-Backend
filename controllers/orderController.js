const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Seller = require("../models/sellerdataModel"); // Import Seller Model
const Razorpay = require('razorpay');
// const razorpay = require("../middleware/razorpayInstance");
const Payment = require("../models/payment");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY_SECRET:", process.env.RAZORPAY_SECRET);
 
// const razorpay = new Razorpay({
//   key_id: 'rzp_test_kaZmE7jKb3pUOl',  // your test key
//   key_secret: '6dGtXf05dnopQNex5bSwILTg'  // your secret key
// });



// exports.placeOrder = async (req, res) => {
//   try {
//     console.log("Received Order Data:", req.body); // ✅ Debugging

//     const { userId, products, paymentMethod, address } = req.body;

//     let totalAmount = 0;
//     const orderedProducts = [];
//     let sellerAddress = "";

//     for (let item of products) {
//       const product = await Product.findById(item.product);
//       if (!product) return res.status(404).json({ message: "Product not found!" });

//       totalAmount += product.price * item.quantity;
      
//       // ✅ Fetch seller address from Seller model
//       const seller = await Seller.findById(product.seller);
//       console.log(seller);
//       if (!seller) return res.status(404).json({ message: "Seller not found!" });

//       sellerAddress = seller.companyInfo.companyAddress; // Auto-assign seller's address
//       sellerPhone= seller.companyInfo.companyPhone; // Auto-assign seller's address
// console.log(sellerAddress);
//       orderedProducts.push({
//         product: product._id,
//         quantity: item.quantity,
//         price: product.price,
//         seller: product.seller,
//       });
//     }

//     const order = new Order({
//       user: userId,
//       products: orderedProducts,
//       totalAmount,
//       paymentMethod,
//       address,
//       sellerAddress, // ✅ Automatically assigned
//       sellerPhone, // ✅ Automatically assigned
//     });

//     console.log("✅ Order Data:", order);

//     await order.save();
//     res.status(201).json({ message: "Order placed successfully", order });
//   } catch (err) {
//     console.error("❌ Order Placement Error:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };

  


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





// exports.verifyPaymentAndPlaceOrder = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       orderDetails // includes userId, products, address, etc.
//     } = req.body;

//     // Step 1: Verify Signature
//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ message: "Payment signature verification failed" });
//     }

//     // Step 2: Update Payment Status
//     const payment = await Payment.findOneAndUpdate(
//       { razorpay_order_id },
//       {
//         razorpay_payment_id,
//         razorpay_signature,
//         status: "Completed"
//       },
//       { new: true }
//     );

//     // Step 3: Place the order in Order model
//     const { userId, products, paymentMethod, address } = orderDetails;
//     let totalAmount = 0;
//     const orderedProducts = [];
//     let sellerAddress = "";
//     let sellerPhone = "";

//     for (let item of products) {
//       const product = await Product.findById(item.product);
//       if (!product) return res.status(404).json({ message: "Product not found!" });

//       totalAmount += product.price * item.quantity;

//       const seller = await Seller.findById(product.seller);
//       if (!seller) return res.status(404).json({ message: "Seller not found!" });

//       sellerAddress = seller.companyInfo.companyAddress;
//       sellerPhone = seller.companyInfo.companyPhone;

//       orderedProducts.push({
//         product: product._id,
//         quantity: item.quantity,
//         price: product.price,
//         seller: product.seller
//       });
//     }

//     const order = new Order({
//       user: userId,
//       products: orderedProducts,
//       totalAmount,
//       paymentMethod: "UPI", // You can pass this from frontend too
//       address,
//       sellerAddress,
//       sellerPhone,
//       paymentStatus: "Completed",
//       paymentInfo: {
//         razorpay_order_id,
//         razorpay_payment_id,
//         razorpay_signature
//       }
//     });

//     await order.save();

//     res.status(200).json({ message: "Order placed successfully!", order });

//   } catch (err) {
//     console.error("Payment verification error:", err);
//     res.status(500).json({ message: "Failed to process payment" });
//   }
// };



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



// exports.getAllOrders = async (req, res) => {
//   try {
//     console.log("Fetching all orders...");

//     const orders = await Order.find()
//       .populate("user", "name email phone") // Populate user details
//       .populate({
//         path: "products.product",
//         select: "name price image", // Select required fields
//       })
//       .populate("products.seller", "companyInfo.companyName companyInfo.companyAddress companyInfo.companyPhone"); // Fetch seller details correctly

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: "No orders found" });
//     }

//     console.log(`✅ Fetched ${orders.length} orders`);
//     res.status(200).json({ orders }); // Return as an object with key "orders"
//   } catch (err) {
//     console.error("❌ Error fetching orders:", err.message);
//     res.status(500).json({ message: "Internal server error. Please try again later." });
//   }
// };

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
