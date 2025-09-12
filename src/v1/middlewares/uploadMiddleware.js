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
    // Determine folder dynamically
    const entityType =
      req.query.entityType || req.headers["x-entity-type"] || "general"; // Use `entityType` field or default to 'general'
    const uploadDir = `uploads/${entityType}`;
    ensureDir(uploadDir); // Ensure the directory exists
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.fieldname}${extension}`); // Format: <timestamp>-<fieldname>.<ext>
  },
});

// File filter to allow only images
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/avif",
  "application/pdf", // PDF
  "application/msword",
];
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Invalid file type. Only JPEG, PNG, AVIF, and GIF are allowed."
      )
    );
  }
};

// Middleware
const upload = multer({
  storage,
  // storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 3 }, // Limit file size to 5MB
});

module.exports = upload;

// const multer = require("multer");

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     "image/jpeg",
//     "image/png",
//     "image/gif",
//     "image/avif",
//     "application/pdf",
//     "application/msword",
//   ];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new multer.MulterError(
//         "LIMIT_UNEXPECTED_FILE",
//         "Invalid file type. Only JPEG, PNG, AVIF, and GIF are allowed."
//       )
//     );
//   }
// };

// const upload = multer({
//   storage: multer.memoryStorage(), //  Use memory storage for buffer access
//   fileFilter,
//   limits: { fileSize: 1024 * 1024 * 3 },
// });

// module.exports = upload;
