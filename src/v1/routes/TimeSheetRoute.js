const express = require('express');
const TimeSheetController = require('../controller/TimeSheetController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/time-sheet', authenticateToken, TimeSheetController.createTimeSheet);
router.get('/time-sheet/:id', authenticateToken, TimeSheetController.findTimeSheetById);
router.put('/time-sheet/:id', authenticateToken, TimeSheetController.updateTimeSheet);
router.delete('/time-sheet/:id', authenticateToken, TimeSheetController.deleteTimeSheet);
router.get('/time-sheet', authenticateToken, TimeSheetController.getAllTimeSheet);

module.exports = router;
