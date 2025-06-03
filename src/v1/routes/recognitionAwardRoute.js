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

// Get all recognition awards
router.get(
  "/recognition-award",
  authenticateToken,
  recognitionAwardController.getAllRecognitionAward
);

// Get a single recognition award by ID
router.get(
  "/recognition-award/:id",
  authenticateToken,
  recognitionAwardController.findRecognitionAward
);

// Update a recognition award by ID
router.put(
  "/recognition-award/:id",
  authenticateToken,
  recognitionAwardController.updateRecognitionAward
);

// Delete  recognition award by ID
router.delete(
  "/recognition-award/:id",
  authenticateToken,
  recognitionAwardController.deleteRecognitionAward
);

module.exports = router;
