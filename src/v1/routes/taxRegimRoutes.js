// Country Routes
const express = require('express');
const taxRegimController = require('../controller/taxRegimController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/tax-regime', authenticateToken, taxRegimController.createTaxRegime);
router.get('/tax-regime/:id', authenticateToken, taxRegimController.findTaxRegimeById);
router.put('/tax-regime/:id', authenticateToken, taxRegimController.updateTaxRegime);
router.delete('/tax-regime/:id', authenticateToken, taxRegimController.deleteTaxRegime);
router.get('/tax-regime', authenticateToken, taxRegimController.getAllTaxRegime);

module.exports = router;