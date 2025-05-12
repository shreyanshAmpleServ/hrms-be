// Country Routes
const express = require('express');
const surveyController = require('../controller/surveyController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/survey', authenticateToken, surveyController.createSurvey);
router.get('/survey/:id', authenticateToken, surveyController.findSurveyById);
router.put('/survey/:id', authenticateToken, surveyController.updateSurvey);
router.delete('/survey/:id', authenticateToken, surveyController.deleteSurvey);
router.get('/survey', authenticateToken, surveyController.getAllSurvey);

module.exports = router;