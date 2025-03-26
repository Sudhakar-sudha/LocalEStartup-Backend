const express = require("express");
const { addToCart, getCartItems, removeFromCart , deleteCart } = require("../controllers/cartController");

const router = express.Router();

router.post("/add", addToCart);
router.get("/:userId", getCartItems);
router.post("/remove", removeFromCart);
// Route to delete the entire cart
router.delete("/delete/:userId", deleteCart);

module.exports = router;
