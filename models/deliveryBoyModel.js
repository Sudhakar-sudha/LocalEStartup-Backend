const mongoose = require("mongoose");

const DeliveryBoySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  vehicleType: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  upiId: { type: String, required: true },
  accountNumber: { type: String, required: true },
  aadharNumber: { type: String, required: true },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  verificationStatus: { 
    type: String, 
    enum: ["Pending", "Verified", "Rejected"], 
    default: "Pending" 
  }, // New verification field
  status: { 
    type: String, 
    enum: ["Pending", "Approved", "Picked Up", "Going to Delivery", "Delivered", "Completed"], 
    default: "Pending" 
  }, // Delivery Status
}, { timestamps: true });

module.exports = mongoose.model("DeliveryBoy", DeliveryBoySchema);
