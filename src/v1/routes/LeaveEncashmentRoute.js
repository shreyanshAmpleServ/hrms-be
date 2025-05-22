const express = require('express');
const LeaveEncashmentController = require('../controller/LeaveEncashmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/leave-encashment', authenticateToken, LeaveEncashmentController.createLeaveEncashment);
router.get('/leave-encashment/:id', authenticateToken, LeaveEncashmentController.findLeaveEncashmentById);
router.put('/leave-encashment/:id', authenticateToken, LeaveEncashmentController.updateLeaveEncashment);
router.delete('/leave-encashment/:id', authenticateToken, LeaveEncashmentController.deleteLeaveEncashment);
router.get('/leave-encashment', authenticateToken, LeaveEncashmentController.getAllLeaveEncashment);

module.exports = router;
