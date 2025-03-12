

const Product = require("../models/productModel");

exports.getProductsBySellerID = async (req, res) => {
  try {
    const { id: sellerId } = req.params;

    console.log("📌 Seller ID received:", sellerId);

    if (!sellerId) {
      return res.status(400).json({ error: "Seller ID is required" });
    }

    // ✅ Fetch products associated with the seller
    const products = await Product.find({ seller: sellerId });

    if (!products.length) {
      // ✅ Return proper response if no products exist
      return res.status(200).json([]); 
    }


    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

