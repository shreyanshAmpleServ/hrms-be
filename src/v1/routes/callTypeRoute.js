const express = require('express');
const callTypeController = require('../controller/callTypeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/call-types', authenticateToken, callTypeController.createCallType);
router.get('/call-types/:id', authenticateToken, callTypeController.getCallTypeById);
router.put('/call-types/:id', authenticateToken, callTypeController.updateCallType);
router.delete('/call-types/:id', authenticateToken, callTypeController.deleteCallType);
router.get('/call-types', authenticateToken, callTypeController.getAllCallTypes);

module.exports = router;
