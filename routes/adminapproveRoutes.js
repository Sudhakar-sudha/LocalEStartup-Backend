const express = require("express");
const router = express.Router();
const { approveProduct ,getPendingProducts, getAllProducts,getApprovedProducts , getAllOrders, deleteOrder , getAllPayments , getOrdersCount , deletePayment } = require("../controllers/adminController"); // ✅ Correct Import

router.put("/approve-product/:id", approveProduct);
router.get("/pending-products", getPendingProducts); // ✅ New API for pending products
router.get("/all-products", getAllProducts); // ✅ New API for pending products
router.get("/approved", getApprovedProducts); // ✅ New API for pending products

router.get('/orders', getAllOrders);
router.delete('/orders/:id', deleteOrder);

// Get order count
router.get('/orders/count', getOrdersCount);  // New endpoint for order count
router.get("/payments", getAllPayments);

router.delete('/payments/:id', deletePayment);
module.exports = router;
