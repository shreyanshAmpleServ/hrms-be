const express = require("express");
const router = express.Router();
const suggestionBoxController = require("../controller/suggestionBoxController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create suggestion box routes
router.post(
  "/suggestion-box",
  authenticateToken,

  suggestionBoxController.createSuggestionBox
);

// Get all suggestion boxes routes
router.get(
  "/suggestion-box",
  authenticateToken,
  suggestionBoxController.getAllSuggestionBox
);

// Get a single suggestion box by ID
router.get(
  "/suggestion-box/:id",
  authenticateToken,
  suggestionBoxController.findSuggestionBox
);

// Update a suggestion box by ID routes
router.put(
  "/suggestion-box/:id",
  authenticateToken,
  suggestionBoxController.updateSuggestionBox
);

// Delete  suggestion box by ID routes
router.delete(
  "/suggestion-box/:id",
  authenticateToken,
  suggestionBoxController.deleteSuggestionBox
);

module.exports = router;
