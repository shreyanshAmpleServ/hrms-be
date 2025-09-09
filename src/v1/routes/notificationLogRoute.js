const express = require("express");
const router = express.Router();
const notificationLogController = require("../controller/notificationLogController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

// Create Notification Center routes
router.post(
  "/notification-log",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Notification Center",
      "create"
    ),
  notificationLogController.createNotificationLog
);

// Get all Notification Centers routes
router.get(
  "/notification-log",
  authenticateToken,
  notificationLogController.getAllNotificationLog
);

// Get a single Notification Center by ID
router.get(
  "/notification-log/:id",
  authenticateToken,
  notificationLogController.findNotificationLog
);

// Update a Notification Center by ID
router.put(
  "/notification-log/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Notification Center",
      "update"
    ),
  notificationLogController.updateNotificationLog
);

// Delete  Notification Center by ID
router.delete(
  "/notification-log/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Notification Center",
      "delete"
    ),
  notificationLogController.deleteNotificationLog
);

module.exports = router;
