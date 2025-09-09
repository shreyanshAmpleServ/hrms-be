const express = require("express");
const router = express.Router();
const warningLetterController = require("../controller/warningLetterController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/uploadMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

// Create warning letter routes (upload middleware needed)
router.post(
  "/warning-letter",
  authenticateToken,
  upload.single("attachment_path"),
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Warning Letters", "create"),
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
  upload.single("attachment_path"),
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Warning Letters", "update"),
  warningLetterController.updateWarningLetter
);

// Delete warning letter by ID (no upload middleware)
router.delete(
  "/warning-letter/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Warning Letters", "delete"),
  warningLetterController.deleteWarningLetter
);

module.exports = router;
