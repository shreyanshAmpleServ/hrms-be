const express = require("express");
const interviewStageRemarkController = require("../controller/interviewStageRemarkController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post(
  "/interview-stage-remark",
  authenticateToken,
  interviewStageRemarkController.createInterviewStageRemark
);

router.get(
  "/interview-stage-remark/:id",
  authenticateToken,
  interviewStageRemarkController.findInterviewStageRemarkById
);

router.put(
  "/interview-stage-remark/:id",
  authenticateToken,
  interviewStageRemarkController.updateInterviewStageRemark
);

router.delete(
  "/interview-stage-remark/:id",
  authenticateToken,
  interviewStageRemarkController.deleteInterviewStageRemark
);

router.get(
  "/interview-stage-remark",
  authenticateToken,
  interviewStageRemarkController.getAllInterviewStageRemark
);

router.patch(
  "/interview-stage-remark/:id/status",
  authenticateToken,
  interviewStageRemarkController.updateInterviewStageRemarkStatus
);

module.exports = router;
