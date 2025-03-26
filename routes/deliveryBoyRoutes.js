const express = require("express");
const router = express.Router();
const deliveryBoyController = require("../controllers/deliveryBoyController");
const upload = require("../middleware/upload");

// router.post("/add", upload.array("selfie", 1), deliveryBoyController.addDeliveryBoy); // Register new delivery boy
router.post("/add", upload.fields([{ name: "selfie" }, { name: "aadharPhoto" }]),deliveryBoyController.addDeliveryBoy); // Register new delivery boy

router.put("/verify/:id", deliveryBoyController.verifyDeliveryBoy); // Admin verifies delivery boy
router.put("/approve/:id", deliveryBoyController.approveDeliveryBoy); // Approve if verified
router.put("/status/:id", deliveryBoyController.updateDeliveryStatus); // Update delivery status
router.post("/verify-otp", deliveryBoyController.verifyOTP);
router.post("/resend-otp", deliveryBoyController.resendOTP);
router.delete("/:id", deliveryBoyController.deleteDeliveryBoy);
// Route to get all delivery boys
router.get("/", deliveryBoyController.getAllDeliveryBoys);
router.post("/login",deliveryBoyController.loginDeliveryBoy);
module.exports = router;
