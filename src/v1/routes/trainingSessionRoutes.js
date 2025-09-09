const express = require("express");
const trainingSessionController = require("../controller/trainingSessionController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/uploadMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

const router = express.Router();

router.post(
  "/training-session",
  authenticateToken,
  upload.single("training_material_path"),
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Training Session Schedule",
      "create"
    ),
  trainingSessionController.createTrainingSession
);
router.get(
  "/training-session/:id",
  authenticateToken,
  trainingSessionController.findTrainingSessionById
);
router.put(
  "/training-session/:id",
  authenticateToken,
  upload.single("training_material_path"),
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Training Session Schedule",
      "update"
    ),
  trainingSessionController.updateTrainingSession
);
router.delete(
  "/training-session/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Training Session Schedule",
      "delete"
    ),
  trainingSessionController.deleteTrainingSession
);
router.get(
  "/training-session",
  authenticateToken,
  trainingSessionController.getAllTrainingSession
);

router.patch(
  "/training-session/:id/status",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Training Session Schedule",
      "update"
    ),
  trainingSessionController.updateTrainingSessionStatus
);

module.exports = router;
