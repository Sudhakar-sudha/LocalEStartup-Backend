const express = require("express");
const router = express.Router();

// const upload = require("../middleware/upload");
const upload = require("../middleware/upload");
const productController = require("../controllers/productController");

// Add Product
router.post("/upload", upload.array("images", 5), productController.addProduct);

// Get all products
router.get("/", productController.getAllProducts);
router.get("/app", productController.getAllProductsforApp);
router.get("/count", productController.getProductCount);

// Get product by ID
router.get("/:id", productController.getProductById);
router.get("/sellerproductcount/:id", productController.getProductsBySeller);


// Update product
router.put("/:id",upload.array("images", 5), productController.updateProduct);

// Delete product
router.delete("/deleteproduct/:id", productController.deleteProductById);

module.exports = router;
