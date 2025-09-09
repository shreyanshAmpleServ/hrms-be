const express = require("express");
const router = express.Router();
const timeSheetTaskController = require("../controller/timeSheetTaskController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

// Create time sheet task routes
router.post(
  "/timesheet-task",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Time Sheet Task", "create"),
  timeSheetTaskController.createTimeSheetTask
);

// Get all time sheet tasks routes
router.get(
  "/timesheet-task",
  authenticateToken,
  timeSheetTaskController.getAllTimesheetTask
);

// Get a single time sheet task by ID routes
router.get(
  "/timesheet-task/:id",
  authenticateToken,
  timeSheetTaskController.findTimesheetTask
);

// Update a time sheet task by ID routes
router.put(
  "/timesheet-task/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Time Sheet Task", "update"),
  timeSheetTaskController.updateTimesheetTask
);

// Delete  time sheet task by ID routes
router.delete(
  "/timesheet-task/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Time Sheet Task", "delete"),
  timeSheetTaskController.deleteTimesheetTask
);

module.exports = router;
