const express = require('express');
const callStatusController = require('../controller/callStatusController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/call-statuses', authenticateToken, callStatusController.createCallStatus);
router.get('/call-statuses/:id', authenticateToken, callStatusController.getCallStatusById);
router.put('/call-statuses/:id', authenticateToken, callStatusController.updateCallStatus);
router.delete('/call-statuses/:id', authenticateToken, callStatusController.deleteCallStatus);
router.get('/call-statuses', authenticateToken, callStatusController.getAllCallStatuses);

module.exports = router;
