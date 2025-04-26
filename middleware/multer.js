const multer = require("multer");

// Configure multer to store files in memory (Base64 conversion)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Max file size: 2MB
    fieldSize: 5 * 1024 * 1024, // Max field size: 5MB
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP, and GIF images are allowed!"), false);
    }
  }
});

module.exports = upload;
