const express = require("express");
const router = express.Router();
const deliveryBoyController = require("../controllers/deliveryBoyController");

router.post("/register", deliveryBoyController.registerDeliveryBoy);
router.get("/verify-aadhar/:aadharNumber", deliveryBoyController.verifyAadhar);
router.get("/verify-license/:licenseNumber", deliveryBoyController.verifyLicense);

module.exports = router;
