const  Category  = require("../models/categoryModel");

// Create a new category
exports.addCategory = async (req, res) => {
    try {
      const { name, description, subcategories } = req.body;
  
      // Check if category name exists
      if (!name) {
        return res.status(400).json({ error: "Category name is required" });
      }
  
      const category = new Category({
        name,
        description,
        subcategories
      });
  
      await category.save();
      res.status(201).json({ message: "Category added successfully", category });
    } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).json({ error: error.message });
    }
  };
  

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error");
  }
};
