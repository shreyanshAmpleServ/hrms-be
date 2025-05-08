// Country Routes
const express = require('express');
const shiftController = require('../controller/shiftController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/shift', authenticateToken, shiftController.createShift);
router.get('/shift/:id', authenticateToken, shiftController.findShiftById);
router.put('/shift/:id', authenticateToken, shiftController.updateShift);
router.delete('/shift/:id', authenticateToken, shiftController.deleteShift);
router.get('/shift', authenticateToken, shiftController.getAllShift);

module.exports = router;