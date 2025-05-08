// Country Routes
const express = require('express');
const PFController = require('../controller/PFController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/provident_fund', authenticateToken, PFController.createPF);
router.get('/provident_fund/:id', authenticateToken, PFController.findPFById);
router.put('/provident_fund/:id', authenticateToken, PFController.updatePF);
router.delete('/provident_fund/:id', authenticateToken, PFController.deletePF);
router.get('/provident_fund', authenticateToken, PFController.getAllPF);

module.exports = router;