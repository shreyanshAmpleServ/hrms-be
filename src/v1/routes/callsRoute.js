const express = require('express');
const callsController = require('../controller/callsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/calls', authenticateToken, callsController.createCalls);
router.get('/calls/:id', authenticateToken, callsController.getCallsById);
router.put('/calls/:id', authenticateToken, callsController.updateCalls);
router.delete('/calls/:id', authenticateToken, callsController.deleteCalls);
router.get('/calls', authenticateToken, callsController.getAllCalls);

module.exports = router;
