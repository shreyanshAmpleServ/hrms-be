const express = require("express");
const router = express.Router();
const timeSheetTask = require("../controller/probationReviewController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create time sheet task routes
router.post(
  "/timesheet-task",
  authenticateToken,

  timeSheetTask.createTimeSheetTask
);

// Get all time sheet tasks routes
router.get(
  "/timesheet-task",
  authenticateToken,
  timeSheetTask.getAllTimeSheetTasks
);

// Get a single time sheet task by ID routes
router.get(
  "/timesheet-task/:id",
  authenticateToken,
  timeSheetTask.findTimeSheetTaskById
);

// Update a time sheet task by ID routes
router.put(
  "/timesheet-task/:id",
  authenticateToken,
  timeSheetTask.updateTimeSheetTask
);

// Delete  time sheet task by ID routes
router.delete(
  "/timesheet-task/:id",
  authenticateToken,
  timeSheetTask.deleteTimeSheetTask
);

module.exports = router;
