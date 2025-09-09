const express = require("express");
const LeaveEncashmentController = require("../controller/LeaveEncashmentController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/leave-encashment",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Leave Encashment", "create"),
  LeaveEncashmentController.createLeaveEncashment
);
router.get(
  "/leave-encashment/:id",
  authenticateToken,
  LeaveEncashmentController.findLeaveEncashmentById
);
router.put(
  "/leave-encashment/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Leave Encashment", "update"),
  LeaveEncashmentController.updateLeaveEncashment
);
router.delete(
  "/leave-encashment/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Leave Encashment", "delete"),
  LeaveEncashmentController.deleteLeaveEncashment
);
router.get(
  "/leave-encashment",
  authenticateToken,
  LeaveEncashmentController.getAllLeaveEncashment
);
router.patch(
  "/leave-encashment/:id/status",
  authenticateToken,
  LeaveEncashmentController.updateLeaveEnchashmentStatus
);

module.exports = router;
