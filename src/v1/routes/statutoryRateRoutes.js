// Country Routes
const express = require('express');
const statutoryRateController = require('../controller/statutoryRateController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/statutory-rate', authenticateToken, statutoryRateController.createStatutoryRate);
router.get('/statutory-rate/:id', authenticateToken, statutoryRateController.findStatutoryRateById);
router.put('/statutory-rate/:id', authenticateToken, statutoryRateController.updateStatutoryRate);
router.delete('/statutory-rate/:id', authenticateToken, statutoryRateController.deleteStatutoryRate);
router.get('/statutory-rate', authenticateToken, statutoryRateController.getAllStatutoryRate);

module.exports = router;