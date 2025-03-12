const mongoose = require('mongoose');

const sellerDataSchema = new mongoose.Schema(
  {
    personalInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      password: { type: String, required: true },
      address: { type: String, required: true },
      gender: { type: String, required: true },
    },
    companyInfo: {
      companyName: { type: String, required: true },
      companyEmail: { type: String, required: true },
      companyPhone: { type: String, required: true },
      companyAddress: { type: String, required: true },
      ownerName: { type: String, required: true },
      products: { type: [String], required: true },
    },
    bankInfo: {
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      branchName: { type: String, required: true },
      accountHolderName: { type: String, required: true },
      bankAddress: { type: String, required: true },
      bankType: { type: String, required: true },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('SellerData', sellerDataSchema);
