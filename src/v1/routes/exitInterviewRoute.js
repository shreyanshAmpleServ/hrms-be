const express = require("express");
const router = express.Router();
const exitInterview = require("../controller/exitInterviewController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create exit interview routes
router.post(
  "/exit-interview",
  authenticateToken,
  exitInterview.createExitInterview
);

// Get all exit interviews routes
router.get(
  "/exit-interview",
  authenticateToken,
  exitInterview.getAllExitInterviews
);

// Get a single exit interview by ID
router.get(
  "/exit-interview/:id",
  authenticateToken,
  exitInterview.findExitInterview
);

// Update a exit interview by ID
router.put(
  "/exit-interview/:id",
  authenticateToken,
  exitInterview.updateExitInterview
);

// Delete  exit interview by ID
router.delete(
  "/exit-interview/:id",
  authenticateToken,
  exitInterview.deleteExitInterview
);

module.exports = router;
