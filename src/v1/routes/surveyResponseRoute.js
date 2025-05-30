const express = require("express");
const router = express.Router();
const surveyResponse = require("../controller/surveyResponseController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create survey response routes
router.post(
  "/survey-response",
  authenticateToken,
  surveyResponse.createSurveyResponse
);

// Get all survey responses routes
router.get(
  "/survey-response",
  authenticateToken,
  surveyResponse.getAllSurveyResponses
);

// Get a single survey response by ID routes
router.get(
  "/survey-response/:id",
  authenticateToken,
  surveyResponse.findSurveyResponse
);

// Update a survey response by ID routes
router.put(
  "/survey-response/:id",
  authenticateToken,
  surveyResponse.updateSurveyResponse
);

// Delete  survey response by ID routes
router.delete(
  "/survey-response/:id",
  authenticateToken,
  surveyResponse.deleteSurveyResponse
);

module.exports = router;
