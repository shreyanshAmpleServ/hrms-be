// Country Routes
const express = require('express');
const taxReliefController = require('../controller/taxReliefController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/tax-relief', authenticateToken, taxReliefController.createTaxRelief);
router.get('/tax-relief/:id', authenticateToken, taxReliefController.findTaxReliefById);
router.put('/tax-relief/:id', authenticateToken, taxReliefController.updateTaxRelief);
router.delete('/tax-relief/:id', authenticateToken, taxReliefController.deleteTaxRelief);
router.get('/tax-relief', authenticateToken, taxReliefController.getAllTaxRelief);

module.exports = router;