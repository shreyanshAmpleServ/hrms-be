const express = require("express");
const LeaveApplyController = require("../controller/LeaveApplyController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");
const router = express.Router();

router.post(
  "/leave-application",
  upload.single("document_attachment"),
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Leave Application", "create"),
  LeaveApplyController.createLeaveApplication
);
router.get(
  "/leave-application/:id",
  authenticateToken,
  LeaveApplyController.findLeaveApplicationById
);
router.put(
  "/leave-application/:id",
  upload.single("document_attachment"),
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Leave Application", "update"),
  LeaveApplyController.updateLeaveApplication
);
router.delete(
  "/leave-application/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Leave Application", "delete"),
  LeaveApplyController.deleteLeaveApplication
);
router.get(
  "/leave-application",
  authenticateToken,
  LeaveApplyController.getAllLeaveApplication
);

router.patch(
  "/leave-application/:id/status",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Leave Application", "update"),
  LeaveApplyController.updateLeaveStatus
);

module.exports = router;
