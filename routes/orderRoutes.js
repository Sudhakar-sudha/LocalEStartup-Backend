const express = require("express");
const { placeOrder, getOrderById, getOrdersByUser, cancelOrder } = require("../controllers/orderController");

const router = express.Router();

router.post("/place", placeOrder);
router.get("/:id", getOrderById);
router.get("/user/:userId", getOrdersByUser);
router.put("/cancel/:id", cancelOrder);

module.exports = router;
