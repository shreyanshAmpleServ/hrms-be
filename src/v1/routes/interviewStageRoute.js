const express = require("express");
const interviewStageController = require("../controller/interviewStageController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post(
  "/interview-stage",
  authenticateToken,
  interviewStageController.createInterviewStage
);

router.get(
  "/interview-stage/:id",
  authenticateToken,
  interviewStageController.findInterviewStageById
);

router.put(
  "/interview-stage/:id",
  authenticateToken,
  interviewStageController.updateInterviewStage
);

router.delete(
  "/interview-stage/:id",
  authenticateToken,
  interviewStageController.deleteInterviewStage
);

router.get(
  "/interview-stage",
  authenticateToken,
  interviewStageController.getAllInterviewStage
);

module.exports = router;
