const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Helper function to ensure directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine folder dynamically based on entityType
    const entityType = req.body.entityType || "general"; // Default folder: 'general'
    const uploadDir = `uploads/${entityType}`;
    ensureDir(uploadDir); // Ensure directory exists
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.fieldname}${extension}`); // Format: <timestamp>-<fieldname>.<ext>
  },
});

// ⚡️ No fileFilter -> Accepts all file types
const upload = multer({
  // storage,
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
});



module.exports = upload;
