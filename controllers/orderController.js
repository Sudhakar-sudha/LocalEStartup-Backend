const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Seller = require("../models/sellerdataModel"); // Import Seller Model

// // 📌 Place a New Order

exports.placeOrder = async (req, res) => {
  try {
    console.log("Received Order Data:", req.body); // ✅ Debugging

    const { userId, products, paymentMethod, address } = req.body;

    let totalAmount = 0;
    const orderedProducts = [];
    let sellerAddress = "";

    for (let item of products) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: "Product not found!" });

      totalAmount += product.price * item.quantity;
      
      // ✅ Fetch seller address from Seller model
      const seller = await Seller.findById(product.seller);
      console.log(seller);
      if (!seller) return res.status(404).json({ message: "Seller not found!" });

      sellerAddress = seller.companyInfo.companyAddress; // Auto-assign seller's address
console.log(sellerAddress);
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
      sellerAddress, // ✅ Automatically assigned
    });

    console.log("✅ Order Data:", order);

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("❌ Order Placement Error:", err.message);
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
    
    if (!Order) {
      throw new Error("Order model is not available.");
    }

    const orderCount = await Order.countDocuments();
    console.log("Total Orders:", orderCount);

    res.status(200).json({ count: orderCount });
  } catch (err) {
    console.error("Error fetching order count:", err.message);

    // Send proper error message
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid request format. Please check the API endpoint." });
    }

    res.status(500).json({ error: `Internal Server Error: ${err.message}` });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    console.log("Fetching all orders...");

    const orders = await Order.find()
      .populate("user", "name email") // Populate user details
      .populate({
        path: "products.product",
        select: "name price image", // Select required fields
      })
      .populate("products.seller", "companyInfo.companyName companyInfo.companyAddress"); // Fetch seller details correctly

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    console.log(`✅ Fetched ${orders.length} orders`);
    res.status(200).json({ orders }); // Return as an object with key "orders"
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    res.status(500).json({ message: "Internal server error. Please try again later." });
  }
};

