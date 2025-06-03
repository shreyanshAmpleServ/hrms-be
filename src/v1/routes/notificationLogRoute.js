const express = require("express");
const router = express.Router();
const notificationLogController = require("../controller/notificationLogController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create notification log routes
router.post(
  "/notification-log",
  authenticateToken,
  notificationLogController.createNotificationLog
);

// Get all notification logs routes
router.get(
  "/notification-log",
  authenticateToken,
  notificationLogController.getAllNotificationLog
);

// Get a single notification log by ID
router.get(
  "/notification-log/:id",
  authenticateToken,
  notificationLogController.findNotificationLog
);

// Update a notification log by ID
router.put(
  "/notification-log/:id",
  authenticateToken,
  notificationLogController.updateNotificationLog
);

// Delete  notification log by ID
router.delete(
  "/notification-log/:id",
  authenticateToken,
  notificationLogController.deleteNotificationLog
);

module.exports = router;
