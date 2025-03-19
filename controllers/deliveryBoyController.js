const DeliveryBoy = require("../models/deliveryBoyModel");

// Register a new Delivery Boy (Default status: Pending, Verification Pending)
exports.addDeliveryBoy = async (req, res) => {
  try {
    const newDeliveryBoy = new DeliveryBoy(req.body);
    await newDeliveryBoy.save();
    res.status(201).json({ message: "Delivery Boy Registered (Pending Verification)", data: newDeliveryBoy });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Verify Delivery Boy (Admin action)
exports.verifyDeliveryBoy = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "Verified" },
      { new: true }
    );
    if (!deliveryBoy) return res.status(404).json({ message: "Delivery Boy not found" });
    res.status(200).json({ message: "Delivery Boy Verified", data: deliveryBoy });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Reject Delivery Boy (Admin action)
exports.rejectDeliveryBoy = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "Rejected" },
      { new: true }
    );
    if (!deliveryBoy) return res.status(404).json({ message: "Delivery Boy not found" });
    res.status(200).json({ message: "Delivery Boy Rejected", data: deliveryBoy });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Approve Delivery Boy (Only if Verified)
exports.approveDeliveryBoy = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);
    if (!deliveryBoy) return res.status(404).json({ message: "Delivery Boy not found" });

    if (deliveryBoy.verificationStatus !== "Verified") {
      return res.status(400).json({ message: "Delivery Boy must be verified before approval" });
    }

    deliveryBoy.status = "Approved";
    await deliveryBoy.save();
    res.status(200).json({ message: "Delivery Boy Approved", data: deliveryBoy });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update Delivery Status (Picked Up → Going to Delivery → Delivered → Completed)
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Picked Up", "Going to Delivery", "Delivered", "Completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid Status Update" });
    }

    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!deliveryBoy) return res.status(404).json({ message: "Delivery Boy not found" });

    res.status(200).json({ message: `Status Updated to ${status}`, data: deliveryBoy });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
