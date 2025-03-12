const express = require("express");
const router = express.Router();
const { approveProduct ,getPendingProducts, getAllProducts,getApprovedProducts} = require("../controllers/adminController"); // ✅ Correct Import

router.put("/approve-product/:id", approveProduct);
router.get("/pending-products", getPendingProducts); // ✅ New API for pending products
router.get("/all-products", getAllProducts); // ✅ New API for pending products
router.get("/approved", getApprovedProducts); // ✅ New API for pending products
module.exports = router;
