const express = require("express");
const notificationSetupController = require("../controller/notificationSetupController");
const { authenticateToken } = require("../middlewares/authMiddleware");

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
  notificationSetupController.updateNotificationSetup
);
router.delete(
  "/notification-setup/:id",
  authenticateToken,
  notificationSetupController.deleteNotificationSetup
);
router.get(
  "/notification-setup",
  authenticateToken,
  notificationSetupController.getAllNotificationSetup
);

module.exports = router;
