const Product = require("../models/productModel");
const transporter = require('../utils/emailTransporter');
const mongoose = require("mongoose");




exports.addProduct = async (req, res) => {
  try {
    const {
      name, description, mrp, price, category, brand, stock, seller, discount,
      returnPolicy, warranty, tags, additionalInformation
    } = req.body;

    const errors = {};

        // Convert stock to a number & validate
    const stockValue = Number(stock);
    if (isNaN(stockValue) || stockValue < 0) {
      errors.stock = "Stock quantity must be a valid number";
    }

    // Check required fields
    if (!name) errors.name = "Product name is required";
    if (!description) errors.description = "Product description is required";
    if (!mrp) errors.mrp = "MRP is required";
    if (!price) errors.price = "Price is required";
    if (!category) errors.category = "Category is required";
    if (!brand) errors.brand = "Brand is required";
    if (!stock) errors.stock = "Stock quantity is required";
    if (!seller) errors.seller = "Seller ID is required";
    if (!req.files || req.files.length === 0) errors.images = "At least one product image is required";

       // Ensure images exist
       let images = [];
       if (req.files && req.files.length > 0) {
         images = req.files.map((file) => file.path);
       } else {
         errors.images = "At least one product image is required";
       }
    // If any errors exist, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: "Please correct the following errors", details: errors });
    }

    let parsedAdditionalInfo = [];
    try {
      parsedAdditionalInfo = additionalInformation ? JSON.parse(additionalInformation) : [];
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON format in additionalInformation" });
    }

    const product = new Product({
      name, description, price, mrp, category, brand, stock, seller, discount,
      images, returnPolicy, warranty,
      tags: tags ? tags.split(",") : [],
      additionalInformation: parsedAdditionalInfo,
      soldCount: 0, ratings: 0, reviews: [], ordered: 0,
      status: "pending", // New products require admin approval
    });

    await product.save();

    // await transporter.sendMail({
    //   to: "localestartup@gmail.com",
    //   subject: "New Product Pending Approval",
    //   html: `<p>A new product <strong>${name}</strong> has been uploaded and needs approval.</p>`,
    // });

    
    await fetch('https://email-service-chi-lemon.vercel.app/send-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: "localestartup@gmail.com",
        subject: "New Product Pending Approval",
        message:`<p>A new product <strong>${name}</strong> has been uploaded and needs approval.</p>`,
      }),
    });

    console.log("email send to the admin");
    res.status(201).json({ message: "Product added successfully!", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};





// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    console.log("Fetching all products...");

    const products = await Product.find()
      .populate("category", "name")  // Ensure 'category' matches schema
      .populate("seller", "personalInfo");

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};





// Get all products
exports.getAllProductsforApp = async (req, res) => {
  try {
    console.log("Fetching all products...");

    const products = await Product.find().populate("category", "name").populate("seller", "personalInfo");
    console.log(products);
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    // Format response to include proper base64 image format
    const formattedProducts = products.map(product => ({
      ...product._doc,
      image: product.image ? `data:image/png;base64,${product.image}` : null
    }));
    console.log(formattedProducts);
    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};






// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category seller");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





exports.updateProduct = async (req, res) => {
  try {
    const { id: productId } = req.params; // Ensure consistent product ID extraction
    let updateData = req.body;

    // ✅ Validate and parse additionalInformation
    if (typeof updateData.additionalInformation === "string") {
      try {
        updateData.additionalInformation = JSON.parse(updateData.additionalInformation);
      } catch (error) {
        return res.status(400).json({ error: "Invalid additionalInformation format!" });
      }
    }

    if (updateData.additionalInformation && !Array.isArray(updateData.additionalInformation)) {
      return res.status(400).json({ error: "additionalInformation must be an array!" });
    }

    // ✅ Validate and filter reviews to contain only valid ObjectIds
    if (!Array.isArray(updateData.reviews)) {
      updateData.reviews = [];
    } else {
      updateData.reviews = updateData.reviews.filter((id) => mongoose.Types.ObjectId.isValid(id));
    }


    // ✅ If new images are uploaded, convert them to Base64
    // if (req.files && req.files.length > 0) {
    //   updateData.images = req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`);
    // }


    //     // ✅ If new images are uploaded, store Cloudinary URLs
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }



    // ✅ Ensure `status` is a string, not an array
    if (Array.isArray(updateData.status)) {
      updateData.status = updateData.status[0]; // Pick the first value
    }
    // ✅ Ensure `status` is always "Pending" upon update
    updateData.status = "pending";

    // ✅ Update the product with validated data
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found!" });
    }
    // await transporter.sendMail({
    //   to: "localestartup@gmail.com",
    //   subject: "Updated Product Pending Approval",
    //   html: `<p>A product <strong>${updatedProduct.name}</strong> has been updated and is pending approval.</p>`,
    // });

        await fetch('https://email-service-chi-lemon.vercel.app/send-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: "localestartup@gmail.com",
        subject: "Updated Product Pending Approval",
        message:`<p>A product <strong>${updatedProduct.name}</strong> has been updated and is pending approval.</p>`,
      }),
    });

    //     console.log("Email sent to the admin");
    res.status(200).json({ message: "Product updated successfully!", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};













// Get total product count
exports.getProductCount = async (req, res) => {
  try {
    console.log("Fetching total product count...");

    const productCount = await Product.countDocuments(); // Get total product count
    console.log(productCount);
    res.status(200).json({ count: productCount });
  } catch (error) {
    console.error("Error fetching product count:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};







// Controller function to fetch products by seller ID
exports.getProductsBySeller = async (req, res) => {
  try {
    const { id: sellerId } = req.params; // Extract sellerId from request params

    // Debugging logs
    console.log("✅ Fetching products for Seller ID:", sellerId);

    if (!sellerId) {
      return res.status(400).json({ message: "❌ Seller ID is required" });
    }

    // Find products belonging to the seller
    const products = await Product.find({ seller: sellerId }).populate("category");

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "❌ No products found for this seller" });
    }

    // Count the number of products
    const productCount = products.length;

    res.status(200).json({ products, productCount });
  } catch (error) {
    console.error("🚨 Error fetching products for seller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};








// // Delete Product by ID
// exports.deleteProductById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedProduct = await Product.findByIdAndDelete(id);

//     if (!deletedProduct) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }

//     res.json({ success: true, message: "Product deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };


const cloudinary = require("../config/cloudinary");

// ✅ Delete Product by ID and Remove Cloudinary Images
exports.deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📌 Product ID received:", id);

    // 🔹 Find product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "❌ Product not found" });
    }

    // 🔹 Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      console.log("🖼️ Images to delete:", product.images);

      const deletePromises = product.images.map(async (imageUrl) => {
        try {
          const publicId = getPublicIdFromUrl(imageUrl); // Correctly extract public ID

          console.log("🔹 Deleting Cloudinary image with Public ID:", publicId);

          const result = await cloudinary.uploader.destroy(publicId);
          console.log("✅ Cloudinary Deletion Result:", result);
          return result;
        } catch (cloudinaryError) {
          console.error("❌ Error deleting image from Cloudinary:", cloudinaryError);
          return null; // Handle failure
        }
      });

      // ✅ Wait for all images to be deleted
      const results = await Promise.all(deletePromises);
      console.log("📌 Cloudinary Deletion Results:", results);
    }

    // 🔹 Delete product from the database
    await Product.findByIdAndDelete(id);
    console.log("✅ Product deleted from database");

    res.json({ success: true, message: "✅ Product and images deleted successfully" });
  } catch (error) {
    console.error("🚨 Error deleting product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Correct Public ID Extraction Function
const getPublicIdFromUrl = (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/"); // Split by "/"
    const filenameWithExt = pathParts[pathParts.length - 1]; // Get last part
    const filenameWithoutExt = filenameWithExt.split(".")[0]; // Remove extension

    // If stored in a folder, get the correct path (e.g., "products/image123")
    return pathParts.length > 2 ? `${pathParts[pathParts.length - 2]}/${filenameWithoutExt}` : filenameWithoutExt;
  } catch (error) {
    console.error("🚨 Error extracting public ID:", error);
    return null;
  }
};

