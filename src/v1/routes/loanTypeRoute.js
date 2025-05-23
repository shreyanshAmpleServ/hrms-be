const express = require('express');
const loanTypeController = require('../controller/loanTypeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/loan-type', authenticateToken,loanTypeController.createLoanType);
router.get('/loan-type/:id', authenticateToken, loanTypeController.findLoanTypeById);
router.put('/loan-type/:id', authenticateToken,loanTypeController.updateLoanType);
router.delete('/loan-type/:id', authenticateToken, loanTypeController.deleteLoanType);
router.get('/loan-type', authenticateToken, loanTypeController.getAllLoanType);

module.exports = router;
