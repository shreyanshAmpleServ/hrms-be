const express = require("express");
const router = express.Router();
const exitClearanceController = require("../controller/exitClearanceController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create exit clearance routes
router.post(
  "/exit-clearance",
  authenticateToken,

  exitClearanceController.createExitClearance
);

// Get all exit clearance routes
router.get(
  "/exit-clearance",
  authenticateToken,
  exitClearanceController.getAllExitClearance
);

// Get a single exit clearance by ID
router.get(
  "/exit-clearance/:id",
  authenticateToken,
  exitClearanceController.findExitClearance
);

// Update a exit clearance by ID
router.put(
  "/exit-clearance/:id",
  authenticateToken,
  exitClearanceController.updateExitClearance
);

// Delete  exit clearance by ID
router.delete(
  "/exit-clearance/:id",
  authenticateToken,
  exitClearanceController.deleteExitClearance
);

router.post(
  "/exit-clearance/exit-clearance-bulk",
  authenticateToken,
  exitClearanceController.checkBulkClearance
);
module.exports = router;
