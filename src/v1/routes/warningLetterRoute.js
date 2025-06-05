const express = require("express");
const router = express.Router();
const warningLetterController = require("../controller/warningLetterController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/uploadMiddleware.js");

// Create warning letter routes (upload middleware needed)
router.post(
  "/warning-letter",
  authenticateToken,
  (req, res, next) => {
    console.log("Incoming files:", req.files, "Single file:", req.file);
    next();
  },
  upload.single("attachment_path"),
  warningLetterController.createWarningLetter
);

// Get all warning letters (no upload middleware)
router.get(
  "/warning-letter",
  authenticateToken,
  warningLetterController.getAllWarningLetters
);

// Get a single warning letter by ID (no upload middleware)
router.get(
  "/warning-letter/:id",
  authenticateToken,
  warningLetterController.findWarningLetter
);

// Update a warning letter by ID (upload middleware needed)
router.put(
  "/warning-letter/:id",
  authenticateToken,
  (req, res, next) => {
    console.log("Incoming files:", req.files, "Single file:", req.file);
    next();
  },
  upload.single("attachment_path"),
  warningLetterController.updateWarningLetter
);

// Delete warning letter by ID (no upload middleware)
router.delete(
  "/warning-letter/:id",
  authenticateToken,
  warningLetterController.deleteWarningLetter
);

module.exports = router;
