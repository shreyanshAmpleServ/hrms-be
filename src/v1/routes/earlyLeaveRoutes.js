const express = require("express");
const earlyLeaveController = require("../controller/earlyLeaveController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/early-leave",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Early Leave", "create"),
  earlyLeaveController.createEarlyLeave
);

router.get(
  "/early-leave/:id",
  authenticateToken,
  earlyLeaveController.findEarlyLeaveById
);

router.put(
  "/early-leave/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Early Leave", "update"),
  earlyLeaveController.updateEarlyLeave
);

router.delete(
  "/early-leave/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Early Leave", "delete"),
  earlyLeaveController.deleteEarlyLeave
);

router.get(
  "/early-leave",
  authenticateToken,
  earlyLeaveController.getAllEarlyLeave
);

router.patch(
  "/early-leave/:id/status",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Early Leave", "update"),
  earlyLeaveController.updateEarlyLeaveStatus
);

module.exports = router;
