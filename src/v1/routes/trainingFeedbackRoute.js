const express = require("express");
const trainingFeedbackController = require("../controller/trainingFeedbackController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/training-feedback",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Training Feedback Entry",
      "create"
    ),
  trainingFeedbackController.createTrainingFeedback
);
router.get(
  "/training-feedback/:id",
  authenticateToken,
  trainingFeedbackController.findTrainingFeedbackById
);
router.put(
  "/training-feedback/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Training Feedback Entry",
      "update"
    ),
  trainingFeedbackController.updateTrainingFeedback
);
router.delete(
  "/training-feedback/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Training Feedback Entry",
      "delete"
    ),
  trainingFeedbackController.deleteTrainingFeedback
);
router.get(
  "/training-feedback",
  authenticateToken,
  trainingFeedbackController.getAllTrainingFeedback
);

module.exports = router;
