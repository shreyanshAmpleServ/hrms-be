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
  setupNotificationMiddleware,
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
  setupNotificationMiddleware,
  LeaveApplyController.updateLeaveApplication
);
router.delete(
  "/leave-application/:id",
  authenticateToken,
  setupNotificationMiddleware,
  LeaveApplyController.deleteLeaveApplication
);
router.get(
  "/leave-application",
  setupNotificationMiddleware,
  authenticateToken,
  LeaveApplyController.getAllLeaveApplication
);

router.patch(
  "/leave-application/:id/status",
  authenticateToken,
  LeaveApplyController.updateLeaveStatus
);

module.exports = router;
