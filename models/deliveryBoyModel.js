const mongoose = require("mongoose");

const DeliveryBoySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  aadharNumber: { type: String, required: true, unique: true },
  licenseNumber: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  photo: { type: String },  // Store selfie/photo
  verificationStatus: { type: String, default: "Pending" },  // Pending, Verified, Rejected
});

module.exports = mongoose.model("DeliveryBoy", DeliveryBoySchema);
