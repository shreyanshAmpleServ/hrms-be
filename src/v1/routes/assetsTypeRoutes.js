// Country Routes
const express = require('express');
const assetsTypeController = require('../controller/assetsTypeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/assets-type', authenticateToken, assetsTypeController.createAssetsType);
router.get('/assets-type/:id', authenticateToken, assetsTypeController.findAssetsTypeById);
router.put('/assets-type/:id', authenticateToken, assetsTypeController.updateAssetsType);
router.delete('/assets-type/:id', authenticateToken, assetsTypeController.deleteAssetsType);
router.get('/assets-type', authenticateToken, assetsTypeController.getAllAssetsType);

module.exports = router;