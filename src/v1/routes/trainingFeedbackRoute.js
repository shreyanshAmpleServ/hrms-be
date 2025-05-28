const express = require('express');
const trainingFeedbackController = require('../controller/trainingFeedbackController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/training-feedback', authenticateToken, trainingFeedbackController.createTrainingFeedback);
router.get('/training-feedback/:id', authenticateToken, trainingFeedbackController.findTrainingFeedbackById);
router.put('/training-feedback/:id', authenticateToken, trainingFeedbackController.updateTrainingFeedback);
router.delete('/training-feedback/:id', authenticateToken, trainingFeedbackController.deleteTrainingFeedback);
router.get('/training-feedback', authenticateToken, trainingFeedbackController.getAllTrainingFeedback);

module.exports = router;
