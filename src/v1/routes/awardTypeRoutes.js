// Country Routes
const express = require('express');
const awartTypeController = require('../controller/awardTypeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/award-type', authenticateToken, awartTypeController.createAwardType);
router.get('/award-type/:id', authenticateToken, awartTypeController.findAwardTypeById);
router.put('/award-type/:id', authenticateToken, awartTypeController.updateAwardType);
router.delete('/award-type/:id', authenticateToken, awartTypeController.deleteAwardType);
router.get('/award-type', authenticateToken, awartTypeController.getAllAwardType);

module.exports = router;