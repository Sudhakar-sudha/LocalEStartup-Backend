

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecommerce_products", // Cloudinary folder name
    format: async (req, file) => "jpg", // Convert all images to JPG
    public_id: (req, file) => file.originalname.split(".")[0], // Keep original name

    // ✅ Compression & Optimization
    transformation: [
      { width: 800, height: 800, crop: "limit" }, // Resize to max 800x800px
      { quality: "auto:low" }, // Automatically compress while keeping quality
      { fetch_format: "auto" }, // Serve in the best format (webp, avif, etc.)
    ],
  },
});

const upload = multer({ storage });

module.exports = upload;
