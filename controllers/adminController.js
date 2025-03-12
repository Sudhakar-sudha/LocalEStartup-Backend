const Product = require("../models/productModel");
const transporter = require('../utils/emailTransporter');

exports.approveProduct = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const product = await Product.findById(req.params.id).populate("seller","personalInfo");
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.status = status;
    await product.save();


    await transporter.sendMail({
      to: product.seller.personalInfo.email,
      subject: `Your Product "${product.name}" has been ${status}`,
      html:`Hello, your product "${product.name}" has been ${status} by the admin.`,
    });
    console.log("email send to the admin");
    res.json({ message: `Product ${status} successfully!`, product });
  } catch (error) {
    console.error("Error approving product:", error);
    res.status(500).json({ message: "Error updating product", error });
  }
};

  

exports.getPendingProducts = async (req, res) => {
  try {
    // Populate seller details (name and email)
    const products = await Product.find({ status: "pending" }).populate("seller", "personalInfo");

    if (!products.length) {
      return res.status(404).json({ message: "No pending products found" });
    }

    // Print seller names in the console
    products.forEach(product => {
      console.log(`Seller Name: ${product.seller?.personalInfo.name  || "Unknown Seller"}`);
    });

    res.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "personalInfo.name email"); // Fetch seller details

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.json({ products });
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};



// Controller to get all approved products
exports.getApprovedProducts = async (req, res) => {
    try {
        const approvedProducts = await Product.find({ status: 'approved' });
        res.json(approvedProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
