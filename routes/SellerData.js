const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerDataController'); // Correct import


// Route for submitting seller data
router.post('/submit-seller-data', sellerController.sellerData);

router.get("/get-seller-by-id/:id", sellerController.getSellerById);

router.post('/login-seller-data', sellerController.loginSeller);

// Route to verify email
router.get('/user/verify/:token',sellerController.verifyEmail);

router.post('/send-otp', sellerController.sendOtp);
router.post('/verify-otp', sellerController.verifyOtp);

router.post("/logout",sellerController.logout);

//  Route to fetch all sellers
router.get("/sellers", sellerController.getAllSellers);

// Route to delete a seller
router.delete("/sellers/:id", sellerController.deleteSeller);


router.get("/sellers/count", sellerController.getSellerCount);

module.exports = router;
