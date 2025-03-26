const mongoose = require("mongoose");

const DeliveryBoySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  dob: { type: String, required: true },
  address: { type: String, required: true },
  vehicleType: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  upiId: { type: String, required: true },
  accountNumber: { type: String, required: true },
  aadharNumber: { type: String, required: true, unique: true },
  selfie: { type: [String], required: true },
  aadharPhoto: { type: [String], required: true },
  otp: { type: String, required: true }, // OTP Field
  otpExpires: { type: Date, default: null },
  verificationStatus: { type: String, enum: ["Pending", "Verified"], default: "Pending" },
  status: { type: String, enum: ["Pending", "Approved", "Picked Up", "Going to Delivery", "Delivered", "Completed"], default: "Pending" },
  adminApproval: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }, // Admin Approval Field
}, { timestamps: true });

module.exports = mongoose.model("DeliveryBoy", DeliveryBoySchema);
