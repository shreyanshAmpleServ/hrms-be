const express = require("express");
const router = express.Router();
const relievingLetterController = require("../controller/relievingLetterController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

// Create relieving letter routes
router.post(
  "/relieving-letter",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Relieving Letter Generation",
      "create"
    ),
  relievingLetterController.createRelievingLetter
);

// Get all Relieving Letter Generation routes
router.get(
  "/relieving-letter",
  authenticateToken,
  relievingLetterController.getAllRelievingLetters
);

// Get a single relieving letter by ID routes
router.get(
  "/relieving-letter/:id",
  authenticateToken,
  relievingLetterController.findRelievingLetter
);

// Update a relieving letter by ID
router.put(
  "/relieving-letter/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Relieving Letter Generation",
      "update"
    ),
  relievingLetterController.updateRelievingLetter
);

// Delete  relieving letter by ID
router.delete(
  "/relieving-letter/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Relieving Letter Generation",
      "delete"
    ),
  relievingLetterController.deleteRelievingLetter
);

module.exports = router;
