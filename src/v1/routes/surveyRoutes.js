// Country Routes
const express = require("express");
const surveyController = require("../controller/surveyController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/survey",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Survey Master", "create"),
  surveyController.createSurvey
);
router.get("/survey/:id", authenticateToken, surveyController.findSurveyById);
router.put(
  "/survey/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Survey Master", "update"),
  surveyController.updateSurvey
);
router.delete(
  "/survey/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Survey Master", "delete"),
  surveyController.deleteSurvey
);
router.get("/survey", authenticateToken, surveyController.getAllSurvey);

module.exports = router;
