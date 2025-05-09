// Country Routes
const express = require('express');
const reviewTempController = require('../controller/reviewTempController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/review-template', authenticateToken, reviewTempController.createReviewTemp);
router.get('/review-template/:id', authenticateToken, reviewTempController.findReviewTempById);
router.put('/review-template/:id', authenticateToken, reviewTempController.updateReviewTemp);
router.delete('/review-template/:id', authenticateToken, reviewTempController.deleteReviewTemp);
router.get('/review-template', authenticateToken, reviewTempController.getAllReviewTemp);

module.exports = router;