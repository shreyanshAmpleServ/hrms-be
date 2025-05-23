const express = require('express');
const loanReqController = require('../controller/loanReqController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/loan-requests', authenticateToken,loanReqController.createLoanRequest);
router.get('/loan-requests/:id', authenticateToken, loanReqController.findLoanRequestById);
router.put('/loan-requests/:id', authenticateToken,loanReqController.updateLoanRequest);
router.delete('/loan-requests/:id', authenticateToken, loanReqController.deleteLoanRequest);
router.get('/loan-requests', authenticateToken, loanReqController.getAllLoanRequest);

module.exports = router;
