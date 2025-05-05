const express = require('express');
const BankController = require('../controller/BankController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/bank-master', authenticateToken, BankController.createBank);
router.get('/bank-master/:id', authenticateToken, BankController.findBankById);
router.put('/bank-master/:id', authenticateToken, BankController.updateBank);
router.delete('/bank-master/:id', authenticateToken, BankController.deleteBank);
router.get('/bank-master', authenticateToken, BankController.getAllBank);

module.exports = router;
