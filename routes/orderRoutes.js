const express = require("express");
const { placeOrder, getOrderById, getOrdersByUser, cancelOrder ,getOrderCount, getAllOrders } = require("../controllers/orderController");

const router = express.Router();

router.get("/count", getOrderCount); // Use "/count" instead of "/c"
router.post("/place", placeOrder);
router.get("/:id", getOrderById);
router.get("/user/:userId", getOrdersByUser);
router.put("/cancel/:id", cancelOrder);
router.get("/",getAllOrders);
module.exports = router;
