const express = require("express");
const { placeOrder, getOrderById, getOrdersByUser, cancelOrder ,getOrderCount, getAllOrders } = require("../controllers/orderController");

const router = express.Router();

router.post("/place", placeOrder);
router.get("/:id", getOrderById);
router.get("/user/:userId", getOrdersByUser);
router.put("/cancel/:id", cancelOrder);
router.get("/",getAllOrders)
// router.get("/countorders", getOrderCount); // ✅ Correct API endpoint


// ✅ Fix: Correct API endpoint to match frontend request
router.get("/", getOrderCount);
module.exports = router;
