const express = require('express');
const callPurposeController = require('../controller/callPurposeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/call-purposes', authenticateToken, callPurposeController.createCallPurpose);
router.get('/call-purposes/:id', authenticateToken, callPurposeController.getCallPurposeById);
router.put('/call-purposes/:id', authenticateToken, callPurposeController.updateCallPurpose);
router.delete('/call-purposes/:id', authenticateToken, callPurposeController.deleteCallPurpose);
router.get('/call-purposes', authenticateToken, callPurposeController.getAllCallPurpose);

module.exports = router;
