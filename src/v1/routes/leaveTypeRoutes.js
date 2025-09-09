// Country Routes
const express = require("express");
const leaveTypeController = require("../controller/leaveTypeController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/leave-type",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Leave Type", "create"),
  leaveTypeController.createLeaveType
);
router.get(
  "/leave-type/:id",
  authenticateToken,
  leaveTypeController.findLeaveTypeById
);
router.put(
  "/leave-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Leave Type", "update"),
  leaveTypeController.updateLeaveType
);
router.delete(
  "/leave-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Leave Type", "delete"),
  leaveTypeController.deleteLeaveType
);
router.get(
  "/leave-type",
  authenticateToken,
  leaveTypeController.getAllLeaveType
);

module.exports = router;
