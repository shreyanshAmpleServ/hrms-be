const express = require("express");
const router = express.Router();
const timeSheetProjectController = require("../controller/timeSheetProjectController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

// Create time sheet project routes
router.post(
  "/timesheet-project",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Time Sheet Project", "create"),
  timeSheetProjectController.createTimeSheetProject
);

// Get all time sheet projects routes
router.get(
  "/timesheet-project",
  authenticateToken,
  timeSheetProjectController.getAllTimeSheetProject
);

// Get a single time sheet project by ID routes
router.get(
  "/timesheet-project/:id",
  authenticateToken,
  timeSheetProjectController.findTimeSheetProject
);

// Update a time sheet project by ID routes
router.put(
  "/timesheet-project/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Time Sheet Project", "update"),
  timeSheetProjectController.updateTimeSheetProject
);

// Delete  time sheet project by ID routes
router.delete(
  "/timesheet-project/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Time Sheet Project", "delete"),
  timeSheetProjectController.deleteTimeSheetProject
);

module.exports = router;
