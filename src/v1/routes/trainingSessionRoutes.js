const express = require("express");
const trainingSessionController = require("../controller/trainingSessionController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/uploadMiddleware.js");

const router = express.Router();

router.post(
  "/training-session",
  authenticateToken,
  upload.single("training_material_path"),
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
  trainingSessionController.updateTrainingSession
);
router.delete(
  "/training-session/:id",
  authenticateToken,
  trainingSessionController.deleteTrainingSession
);
router.get(
  "/training-session",
  authenticateToken,
  trainingSessionController.getAllTrainingSession
);

module.exports = router;
