const express = require("express");
const router = express.Router();
const exitClearanceController = require("../controller/exitClearanceController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

// Create exit clearance routes
router.post(
  "/exit-clearance",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Exit Clearance Checklist",
      "create"
    ),
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
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Exit Clearance Checklist",
      "update"
    ),
  exitClearanceController.updateExitClearance
);

// Delete  exit clearance by ID
router.delete(
  "/exit-clearance/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Exit Clearance Checklist",
      "delete"
    ),
  exitClearanceController.deleteExitClearance
);

router.post(
  "/exit-clearance/exit-clearance-bulk",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Exit Clearance", "create"),
  exitClearanceController.checkBulkClearance
);
module.exports = router;
