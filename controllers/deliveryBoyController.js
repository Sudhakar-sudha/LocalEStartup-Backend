const DeliveryBoy = require("../models/deliveryBoyModel");
const axios = require("axios");

// Register a New Delivery Boy
exports.registerDeliveryBoy = async (req, res) => {
  try {
    const { name, phone, aadharNumber, licenseNumber, address } = req.body;

    // Check if already registered
    const existingBoy = await DeliveryBoy.findOne({ aadharNumber });
    if (existingBoy) return res.status(400).json({ error: "Already registered!" });

    // Save to Database
    const deliveryBoy = new DeliveryBoy({ name, phone, aadharNumber, licenseNumber, address });
    await deliveryBoy.save();
    
    res.json({ message: "Delivery Boy Registered. Verification Pending." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 

// Verify Aadhar (API Call)
exports.verifyAadhar = async (req, res) => {
  try {
    const { aadharNumber } = req.params;

    const response = await axios.post(
      "https://api.uidai.gov.in/verify-aadhar",
      { aadharNumber },
      { headers: { Authorization: "Bearer YOUR_API_KEY" } }
    );

    if (response.data.status === "valid") {
      await DeliveryBoy.findOneAndUpdate({ aadharNumber }, { verificationStatus: "Aadhar Verified" });
      res.json({ message: "✅ Aadhar Verified", data: response.data });
    } else {
      res.status(400).json({ error: "❌ Invalid Aadhar!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Aadhar Verification Failed" });
  }
};

// Verify License (API Call)
exports.verifyLicense = async (req, res) => {
  try {
    const { licenseNumber } = req.params;

    const response = await axios.get(
      `https://parivahan.gov.in/api/dl/verify?licenseNumber=${licenseNumber}`,
      { headers: { Authorization: "Bearer YOUR_API_KEY" } }
    );

    if (response.data.status === "valid") {
      await DeliveryBoy.findOneAndUpdate({ licenseNumber }, { verificationStatus: "License Verified" });
      res.json({ message: "✅ License Verified", data: response.data });
    } else {
      res.status(400).json({ error: "❌ Invalid License!" });
    }
  } catch (error) {
    res.status(500).json({ error: "License Verification Failed" });
  }
};
