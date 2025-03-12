const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "categories", required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true }, 
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    soldCount: { type: Number, default: 0 },
    images: [{ type: String, required: true }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "SellerData", required: true },
    ratings: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    ordered: { type: Boolean, default: false },
    tags: [{ type: String }],
    returnPolicy: { type: String },
    warranty: { type: String },
    additionalInformation: [{ title: String, description: String }], // Array format for extra product details
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, // Approval system

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });


  module.exports= mongoose.model("Product", productSchema);
  
  