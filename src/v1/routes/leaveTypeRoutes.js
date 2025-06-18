// Country Routes
const express = require("express");
const leaveTypeController = require("../controller/leaveTypeController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/leave-type",
  authenticateToken,
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
  leaveTypeController.updateLeaveType
);
router.delete(
  "/leave-type/:id",
  authenticateToken,
  leaveTypeController.deleteLeaveType
);
router.get(
  "/leave-type",
  authenticateToken,
  leaveTypeController.getAllLeaveType
);

module.exports = router;
