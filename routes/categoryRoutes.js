const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Create Category
router.post("/", categoryController.addCategory);

// Get all categories
router.get("/", categoryController.getAllCategories);

module.exports = router;
