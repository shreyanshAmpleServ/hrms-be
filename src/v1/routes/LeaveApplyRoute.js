const express = require("express");
const LeaveApplyController = require("../controller/LeaveApplyController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware.js");
const router = express.Router();

router.post(
  "/leave-application",
  upload.single("document_attachment"),
  authenticateToken,
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
  LeaveApplyController.updateLeaveApplication
);
router.delete(
  "/leave-application/:id",
  authenticateToken,
  LeaveApplyController.deleteLeaveApplication
);
router.get(
  "/leave-application",
  authenticateToken,
  LeaveApplyController.getAllLeaveApplication
);

module.exports = router;
