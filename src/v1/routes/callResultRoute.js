const express = require('express');
const callResultController = require('../controller/callResultController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/call-results', authenticateToken, callResultController.createCallResult);
router.get('/call-results/:id', authenticateToken, callResultController.getCallResultById);
router.put('/call-results/:id', authenticateToken, callResultController.updateCallResult);
router.delete('/call-results/:id', authenticateToken, callResultController.deleteCallResult);
router.get('/call-results', authenticateToken, callResultController.getAllCallResults);

module.exports = router;
