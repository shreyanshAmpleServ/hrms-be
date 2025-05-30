const express = require("express");
const router = express.Router();
const relievingLetterController = require("../controller/relievingLetterController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create relieving letter routes
router.post(
  "/relieving-letter",
  authenticateToken,
  relievingLetterController.createRelievingLetter
);

// Get all relieving letters routes
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

// Update a relieving letter by ID routes
router.put(
  "/relieving-letter/:id",
  authenticateToken,
  relievingLetterController.updateRelievingLetter
);

// Delete  relieving letter by ID routes
router.delete(
  "/relieving-letter/:id",
  authenticateToken,
  relievingLetterController.deleteRelievingLetter
);

module.exports = router;
