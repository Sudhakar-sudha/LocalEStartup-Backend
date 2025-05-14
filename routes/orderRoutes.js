const express = require("express");
const { placeOrder, getOrderById, getOrdersByUser, cancelOrder ,getOrderCount, getAllOrders ,createRazorpayOrder, verifyPaymentAndPlaceOrder , getSellerOrders , getSellerOrdersCount ,getDeliveredOrders} = require("../controllers/orderController");

const router = express.Router();

router.get("/count", getOrderCount); // Use "/count" instead of "/c"
// router.post("/place", placeOrder);
router.get("/user/:userId", getOrdersByUser);
router.put("/cancel/:id", cancelOrder);
router.get("/",getAllOrders);


router.post("/placeorder", createRazorpayOrder);       // create Razorpay order
router.post("/verifyorder", verifyPaymentAndPlaceOrder); // verify payment + place order
router.get("/seller/:sellerId/orders", getSellerOrders);
// router.get("/sellerordercount/:sellerid",getSellerOrdersCount);
// routes/orderRoutes.js or similar
router.get("/sellerordercount/:sellerId", getSellerOrdersCount);


router.get('/delivered', getDeliveredOrders); // Route to get delivered orders


router.get("/:id", getOrderById);

module.exports = router;
