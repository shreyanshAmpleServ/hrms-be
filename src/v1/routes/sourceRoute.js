const express = require('express');
const sourceController = require('../controller/sourceController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/sources', authenticateToken, sourceController.createSource);
router.get('/sources/:id', authenticateToken, sourceController.getSourceById);
router.put('/sources/:id', authenticateToken, sourceController.updateSource);
router.delete('/sources/:id', authenticateToken, sourceController.deleteSource);
router.get('/sources', authenticateToken, sourceController.getAllSources);

module.exports = router;
