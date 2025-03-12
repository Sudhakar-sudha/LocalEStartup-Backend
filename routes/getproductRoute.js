const express = require("express");
const router = express.Router();

const getproductController = require("../controllers/getproductController");

// ✅ FIXED: Get products by sellerId
router.get("/:id", getproductController.getProductsBySellerID);


module.exports = router;