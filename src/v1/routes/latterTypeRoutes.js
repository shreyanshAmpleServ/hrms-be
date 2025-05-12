// Country Routes
const express = require('express');
const latterTypeController = require('../controller/latterTypeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/latter-type', authenticateToken, latterTypeController.createLatterType);
router.get('/latter-type/:id', authenticateToken, latterTypeController.findLatterTypeById);
router.put('/latter-type/:id', authenticateToken, latterTypeController.updateLatterType);
router.delete('/latter-type/:id', authenticateToken, latterTypeController.deleteLatterType);
router.get('/latter-type', authenticateToken, latterTypeController.getAllLatterType);

module.exports = router;