const express = require("express");
const router = express.Router();
const surveyTemplateController = require("../controller/surveyTemplateController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
// const {
//   setupNotificationMiddleware,
// } = require("../middlewares/notificationMiddleware.js");

// Create survey template routes
router.post(
  "/survey-template",
  authenticateToken,
  // (req, res, next) =>
  //   setupNotificationMiddleware(req, res, next, "Survey template", "create"),
  surveyTemplateController.createSurveyTemplate,
);

// Get all survey templates routes
router.get(
  "/survey-template",
  authenticateToken,
  surveyTemplateController.getAllSurveyTemplates,
);

// Get a single survey template by ID routes
router.get(
  "/survey-template/:id",
  authenticateToken,
  surveyTemplateController.findSurveyById,
);

// Update a survey template by ID routes
router.put(
  "/survey-template/:id",
  authenticateToken,
  // (req, res, next) =>
  //   setupNotificationMiddleware(req, res, next, "Survey template", "update"),
  surveyTemplateController.updateSurveyTemplate,
);
router.put(
  "/survey-template/:id/question",
  authenticateToken,
  // (req, res, next) =>
  //   setupNotificationMiddleware(req, res, next, "Survey template", "update"),
  surveyTemplateController.replaceSurveyQuestions,
);

// Delete  survey template by ID routes
router.delete(
  "/survey-template/:id",
  authenticateToken,
  // (req, res, next) =>
  //   setupNotificationMiddleware(req, res, next, "Survey template", "delete"),
  surveyTemplateController.deleteSurveyTemplate,
);

module.exports = router;
