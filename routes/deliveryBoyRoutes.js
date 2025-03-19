const express = require("express");
const router = express.Router();
const deliveryBoyController = require("../controllers/deliveryBoyController");

router.post("/add", deliveryBoyController.addDeliveryBoy); // Register new delivery boy
router.put("/verify/:id", deliveryBoyController.verifyDeliveryBoy); // Admin verifies delivery boy
router.put("/reject/:id", deliveryBoyController.rejectDeliveryBoy); // Admin rejects delivery boy
router.put("/approve/:id", deliveryBoyController.approveDeliveryBoy); // Approve if verified
router.put("/status/:id", deliveryBoyController.updateDeliveryStatus); // Update delivery status

module.exports = router;
