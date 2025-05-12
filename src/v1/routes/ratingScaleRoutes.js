// Country Routes
const express = require('express');
const ratingScaleController = require('../controller/ratingScaleController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/rating-scale', authenticateToken, ratingScaleController.createRatingScale);
router.get('/rating-scale/:id', authenticateToken, ratingScaleController.findRatingScaleById);
router.put('/rating-scale/:id', authenticateToken, ratingScaleController.updateRatingScale);
router.delete('/rating-scale/:id', authenticateToken, ratingScaleController.deleteRatingScale);
router.get('/rating-scale', authenticateToken, ratingScaleController.getAllRatingScale);

module.exports = router;