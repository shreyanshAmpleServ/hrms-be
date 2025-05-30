const express = require("express");
const router = express.Router();
const recognitionAwardController = require("../controller/recognitionAwardController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create recognition award routes
router.post(
  "/recognition-award",
  authenticateToken,

  recognitionAwardController.createRecognitionAward
);

// Get all recognition awards routes
router.get(
  "/recognition-award",
  authenticateToken,
  recognitionAwardController.getAllRecognitionAward
);

// Get a single recognition award by ID routes
router.get(
  "/recognition-award/:id",
  authenticateToken,
  recognitionAwardController.findRecognitionAward
);

// Update a recognition award by ID routes
router.put(
  "/recognition-award/:id",
  authenticateToken,
  recognitionAwardController.updateRecognitionAward
);

// Delete  recognition award by ID routes
router.delete(
  "/recognition-award/:id",
  authenticateToken,
  recognitionAwardController.deleteRecognitionAward
);

module.exports = router;
