const express = require("express");
const notificationSetupController = require("../controller/notificationSetupController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.get(
  "/notification-setup/available-users",
  authenticateToken,
  notificationSetupController.getAvailableUsers
);

router.get(
  "/notification-setup/action-types",
  authenticateToken,
  notificationSetupController.getActionTypes
);
router.post(
  "/notification-setup",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Notification Setup", "create"),
  notificationSetupController.createNotificationSetup
);
router.get(
  "/notification-setup/:id",
  authenticateToken,
  notificationSetupController.findNotificationSetupById
);
router.put(
  "/notification-setup/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Notification Setup", "update"),
  notificationSetupController.updateNotificationSetup
);
router.delete(
  "/notification-setup/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Notification Setup", "delete"),
  notificationSetupController.deleteNotificationSetup
);
router.get(
  "/notification-setup",
  authenticateToken,
  notificationSetupController.getAllNotificationSetup
);

module.exports = router;
