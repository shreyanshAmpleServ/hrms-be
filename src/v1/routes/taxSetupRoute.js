const express = require('express');
const taxSetupController = require('../controller/taxSetupController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/tax-setup', authenticateToken, taxSetupController.createTaxSetup);
router.get('/tax-setup/:id', authenticateToken, taxSetupController.findTaxSetupById);
router.put('/tax-setup/:id', authenticateToken, taxSetupController.updateTaxSetup);
router.delete('/tax-setup/:id', authenticateToken, taxSetupController.deleteSetup);
router.get('/tax-setup', authenticateToken, taxSetupController.getAllTaxSetup);

module.exports = router;
