
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const SellerDataModel = require('../models/sellerdataModel'); // Ensure correct model import
const TokenModel = require('../models/tokenModel');
const transporter = require('../utils/emailTransporter');
const moment = require('moment');
const ProductModel = require("../models/productModel"); // Product model


// Validate and handle seller registration
exports.sellerData = async (req, res) => {
  const sellerData = req.body;

  // Validate required fields for personal, company, and bank info
  const { personalInfo, companyInfo, bankInfo } = sellerData;

  if (!personalInfo || !companyInfo || !bankInfo) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const { name, email, phone, password, address, gender } = personalInfo;
  const { companyName, companyEmail, companyPhone, companyAddress, ownerName, products } = companyInfo;
  const { bankName, accountNumber, branchName, accountHolderName, bankAddress, bankType } = bankInfo;

  // Validate personal info
  if (!name || !email || !phone || !password || !address || !gender) {
    return res.status(400).json({ error: "Personal information is incomplete" });
  }
// assuming name is in personalInfo

  // Trim leading and trailing spaces and check for invalid name format
  const trimmedName = name.trim();

  // Validate: Name should not be empty, contain only letters and single spaces between words, and no consecutive spaces
  if (!trimmedName || !/^[a-zA-Z\s]+$/.test(trimmedName) || /\s{2,}/.test(trimmedName)) {
    return res.status(400).json({ error: "Invalid name. Name must contain only letters and a single space between words, without consecutive spaces." });
  }

  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  // Validate company info
  if (!companyName || !companyEmail || !companyPhone || !companyAddress || !ownerName || !Array.isArray(products)) {
    return res.status(400).json({ error: "Company information is incomplete" });
  }

  // Validate bank info
  if (!bankName || !accountNumber || !branchName || !accountHolderName || !bankAddress || !bankType) {
    return res.status(400).json({ error: "Bank information is incomplete" });
  }

  try {
    // Check if email already exists
    const existingUser = await SellerDataModel.findOne({ 'personalInfo.email': email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new seller data
    const newSellerData = {
      personalInfo: {
        name,
        email,
        phone,
        password: hashedPassword,
        address,
        gender,
      },
      companyInfo: {
        companyName,
        companyEmail,
        companyPhone,
        companyAddress,
        ownerName,
        products,
      },
      bankInfo: {
        bankName,
        accountNumber,
        branchName,
        accountHolderName,
        bankAddress,
        bankType,
      },
    };

    // Save the seller data to the database
    const seller = await SellerDataModel.create(newSellerData);

function generateSixDigitToken() {
  return (crypto.randomInt(100000, 1000000)).toString();
}

const token = generateSixDigitToken();
console.log(token);
    
    const expirationTime = moment().add(5, 'minutes').toDate(); // Expires in 10 minutes

    // Store OTP in TokenModel
    await TokenModel.create({
      userId: seller._id,
      token,
      expiresAt: expirationTime,
    });

    // Send OTP via Email
    // await transporter.sendMail({
    //   to: email,
    //   subject: "Your OTP for Verification",
    //   html: `<p>Your OTP for verification is: <strong>${token}</strong></p>
    //          <p>This OTP is valid for 5 minutes.</p>`,
    // });

    
    await fetch('https://email-service-chi-lemon.vercel.app/send-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: "Your OTP for Verification",
        message: `<p>Your OTP for verification is: <strong>${token}</strong></p>
             <p>This OTP is valid for 5 minutes.</p>`,
      }),
    });

    res.status(200).json({ status: "Success", message: "Signup successful! Check your email for verification." });
    console.log(token);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred during signup." });
  }
};



















exports.getSellerById = async (req, res) => {
  try {
    const seller = await SellerDataModel.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};








// Get all sellers
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await SellerDataModel.find({});
    res.status(200).json(sellers);
  } catch (err) {
    console.error("Error fetching sellers:", err);
    res.status(500).json({ error: "Error fetching sellers" });
  }
};

// Delete a seller
// exports.deleteSeller = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const seller = await SellerDataModel.findByIdAndDelete(id);
//     if (!seller) {
//       return res.status(404).json({ error: "Seller not found" });
//     }
//     res.status(200).json({ message: "Seller deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting seller:", err);
//     res.status(500).json({ error: "Error deleting seller" });
//   }
// };



// // Delete a seller and their associated products
// exports.deleteSeller = async (req, res) => {
//   const { id } = req.params;

//   try {
//     // Find and delete the seller
//     const seller = await SellerDataModel.findByIdAndDelete(id); 
//     if (!seller) {
//       return res.status(404).json({ error: "Seller not found" });
//     }

//     // Delete all products linked to this seller
//     await ProductModel.deleteMany({ seller: id });

//     res.status(200).json({ message: "Seller and associated products deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting seller and products:", err);
//     res.status(500).json({ error: "Error deleting seller and products" });
//   }
// };

const cloudinary = require("../config/cloudinary");

// ✅ Function to delete seller, products, and images
exports.deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📌 Deleting Seller with ID:", id);

    // 🔹 Find the seller
    const seller = await SellerDataModel.findById(id);
    if (!seller) {
      return res.status(404).json({ error: "❌ Seller not found" });
    }

    // 🔹 Find all products linked to this seller
    const products = await ProductModel.find({ seller: id });

    if (products.length > 0) {
      console.log(`🖼️ Found ${products.length} products linked to the seller`);

      // 🔹 Collect all image URLs from products
      const imageUrls = products.flatMap((product) => product.images || []);
      console.log("🖼️ Images to delete:", imageUrls);

      if (imageUrls.length > 0) {
        // 🔹 Delete images from Cloudinary
        const deletePromises = imageUrls.map(async (imageUrl) => {
          try {
            const publicId = getPublicIdFromUrl(imageUrl);
            if (publicId) {
              const result = await cloudinary.uploader.destroy(publicId);
              console.log(`✅ Deleted Image: ${publicId} | Cloudinary Response:`, result);
              return result;
            }
          } catch (err) {
            console.error("❌ Error deleting image from Cloudinary:", err);
            return null;
          }
        });

        // 🔹 Wait for all images to be deleted
        await Promise.all(deletePromises);
        console.log("✅ All images deleted from Cloudinary");
      }
    }

    // 🔹 Delete all products linked to this seller
    await ProductModel.deleteMany({ seller: id });
    console.log("✅ All products deleted");

    // 🔹 Delete the seller
    await SellerDataModel.findByIdAndDelete(id);
    console.log("✅ Seller deleted");

    res.status(200).json({ message: "✅ Seller, products, and images deleted successfully" });
  } catch (error) {
    console.error("🚨 Error deleting seller and products:", error);
    res.status(500).json({ error: "Error deleting seller and products" });
  }
};

// ✅ Extract Public ID from Cloudinary URL
const getPublicIdFromUrl = (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/"); // Split URL path
    const filenameWithExt = pathParts[pathParts.length - 1]; // Last part (e.g., "image123.jpg")
    const filenameWithoutExt = filenameWithExt.split(".")[0]; // Remove file extension

    // If stored in a folder, keep the folder structure (e.g., "products/image123")
    return pathParts.length > 2 ? `${pathParts[pathParts.length - 2]}/${filenameWithoutExt}` : filenameWithoutExt;
  } catch (error) {
    console.error("🚨 Error extracting public ID:", error);
    return null;
  }
};





exports.getSellerCount = async (req, res) => {
  try {
    const sellerCount = await SellerDataModel.countDocuments();
    res.status(200).json({ count: sellerCount });
  } catch (err) {
    console.error("Error fetching seller count:", err);
    res.status(500).json({ error: "Error fetching seller count" });
  }
};







  


exports.loginSeller = async (req, res) => {
  const { email } = req.body;

  if (!email ) {
    return res.status(400).json({ status: "Failed", message: "Empty input fields!" });
  }

  try {
    const seller = await SellerDataModel.findOne({ "personalInfo.email": email.trim().toLowerCase() });

    if (!seller) {
      return res.status(404).json({ status: "Failed", message: "Invalid credentials!" });
    }

  

    // Generate a six-digit token and set expiration time
    const token = generateSixDigitToken();
    const expirationTime = moment().add(5, 'minutes').toDate(); // Expires in 5 minutes

    // Store OTP in TokenModel
    await TokenModel.create({
      userId: seller._id,  // Use seller._id, not seller.id
      token,
      expiresAt: expirationTime,
    });


    await fetch('https://email-service-chi-lemon.vercel.app/send-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: "Your OTP for Verification",
        message: `<p>Your OTP for verification is: <strong>${token}</strong></p>
             <p>This OTP is valid for 5 minutes.</p>`,
      }),
    });


    // Send OTP via Email
    // await transporter.sendMail({
    //   to: email,
    //   subject: "Your OTP for Verification",
    //   html: `<p>Your OTP for verification is: <strong>${token}</strong></p>
    //          <p>This OTP is valid for 5 minutes.</p>`,
    // });


    console.log(token);
    // res.status(200).json({ message: "OTP sent successfully!" });
    res.status(200).json({
            status: "Success",
            message: "Login successful!",
            user: {
              id: seller._id,
              name: seller.personalInfo.name,
              email: seller.personalInfo.email,
              phone: seller.personalInfo.phone,
            },
          });
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).json({ status: "Failed", message: "An error occurred", error: err.message });
  }
};









// // Verify email address
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const tokenData = await TokenModel.findOne({ token });

    if (!tokenData) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

        // Check if the token has expired
        const currentTime = moment();
        const tokenExpirationTime = moment(tokenData.expiresAt);
    
        if (currentTime.isAfter(tokenExpirationTime)) {
          await TokenModel.findByIdAndDelete(tokenData._id)
          return res.status(400).json({ error: "Token has expired." });
        }
    

    const user = await SellerDataModel.findById(tokenData.userId);
    // console.log(user.id);
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    user.isVerified = true;
    await user.save();
    res.status(200).json({ 
      status: "Success",
      message: "Email verified successfully!",
      user: {
        id: user._id,
        name: user.personalInfo.name,          // Add any other fields you want to show
        email: user.personalInfo.email,
        verified: user.isVerified,
      }
     });


 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred during verification." });
  }
};











// Generate OTP Function
function generateSixDigitToken() {
  return (crypto.randomInt(100000, 1000000)).toString();
}

// 📌 Route: Generate & Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const user = await SellerDataModel.findOne({ "personalInfo.email": email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate OTP
    const token = generateSixDigitToken();


    const expirationTime = moment().add(5, 'minutes').toDate(); // Expires in 10 minutes

    // Store OTP in TokenModel
    await TokenModel.create({
      userId: user._id,
      token,
      expiresAt: expirationTime,
    });

    // Send OTP via Email
    // await transporter.sendMail({
    //   to: email,
    //   subject: "Your OTP for Verification",
    //   html: `<p>Your OTP for verification is: <strong>${token}</strong></p>
    //          <p>This OTP is valid for 5 minutes.</p>`,
    // });

    
    await fetch('https://email-service-chi-lemon.vercel.app/send-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: "Your OTP for Verification",
        message: `<p>Your OTP for verification is: <strong>${token}</strong></p>
             <p>This OTP is valid for 5 minutes.</p>`,
      }),
    });
    console.log(token);
    res.json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Route: Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Get user and check OTP
    const user = await SellerDataModel.findOne({ "personalInfo.email": email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log(`Searching for OTP: ${otp} for user: ${user._id}`);
    const tokenEntry = await TokenModel.findOne({ userId: user._id, token: otp });
    // console.log(tokenEntry);
    
    if (!tokenEntry) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check if OTP has expired
    if (moment().isAfter(tokenEntry.expiresAt)) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    res.json({ message: "OTP verified successfully!", token: otp });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




exports.logout= async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Find and delete the token from the database
    const result = await TokenModel.deleteOne({ token });

    // if (result.deletedCount === 0) {
    //   return res.status(404).json({ message: "Token not found or already deleted" });
    // }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


