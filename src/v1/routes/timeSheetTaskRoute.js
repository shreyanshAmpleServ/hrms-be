const express = require("express");
const router = express.Router();
const timeSheetTaskController = require("../controller/timeSheetTaskController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create time sheet task routes
router.post(
  "/timesheet-task",
  authenticateToken,

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
  timeSheetTaskController.updateTimesheetTask
);

// Delete  time sheet task by ID routes
router.delete(
  "/timesheet-task/:id",
  authenticateToken,
  timeSheetTaskController.deleteTimesheetTask
);

module.exports = router;
