const express = require("express");
const router = express.Router();
const surveyResponse = require("../controller/surveyResponseController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create exit interview routes
router.post(
  "/survey-response",
  authenticateToken,
  surveyResponse.createSurveyResponse
);

// Get all exit interviews routes
router.get(
  "/survey-response",
  authenticateToken,
  surveyResponse.getAllSurveyResponses
);

// Get a single exit interview by ID routes
router.get(
  "/survey-response/:id",
  authenticateToken,
  surveyResponse.findSurveyResponse
);

// Update a exit interview by ID routes
router.put(
  "/survey-response/:id",
  authenticateToken,
  surveyResponse.updateSurveyResponse
);

// Delete  exit interview by ID routes
router.delete(
  "/survey-response/:id",
  authenticateToken,
  surveyResponse.deleteSurveyResponse
);

module.exports = router;
