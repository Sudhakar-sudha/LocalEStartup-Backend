const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "SellerData", required: true }
      }
    ],
    sellerAddress: { type: String, required: true },
    sellerPhone: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { 
      type: String, 
      enum: ["COD", "Credit Card", "Debit Card", "UPI", "Net Banking", "Wallet"], 
      required: true 
    },
    paymentStatus: { type: String, enum: ["Pending", "Completed", "Failed", "Refunded"], default: "Pending" },
    orderStatus: { 
      type: String, 
      enum: ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"], 
      default: "Placed" 
    },
    address: { type: String, required: true },
    deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy" },
    estimatedDelivery: { type: Date },
    placedAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model("Order", orderSchema);
  