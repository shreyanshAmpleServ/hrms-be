const express = require("express");
const router = express.Router();
const suggestionBoxController = require("../controller/suggestionBoxController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
// Create Employee Suggestion routes
router.post(
  "/suggestion-box",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Employee Suggestion",
      "create"
    ),
  suggestionBoxController.createSuggestionBox
);

// Get all Employee Suggestiones routes
router.get(
  "/suggestion-box",
  authenticateToken,
  suggestionBoxController.getAllSuggestionBox
);

// Get a single Employee Suggestion by ID
router.get(
  "/suggestion-box/:id",
  authenticateToken,
  suggestionBoxController.findSuggestionBox
);

// Update a Employee Suggestion by ID routes
router.put(
  "/suggestion-box/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Employee Suggestion",
      "update"
    ),
  suggestionBoxController.updateSuggestionBox
);

// Delete  Employee Suggestion by ID routes
router.delete(
  "/suggestion-box/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Employee Suggestion",
      "delete"
    ),
  suggestionBoxController.deleteSuggestionBox
);

module.exports = router;
