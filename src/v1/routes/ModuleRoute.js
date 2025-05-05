const express = require('express');
const moduleController = require('../controller/ModuleController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/module-related_to', authenticateToken, moduleController.createModuleRelatedTo);
router.put('/module-related_to/:id', authenticateToken, moduleController.updateModuleRelatedTo);
router.delete('/module-related_to/:id', authenticateToken, moduleController.deleteModuleRelatedTo);
router.get('/module-related_to', authenticateToken, moduleController.getModuleRelatedTos);

module.exports = router;
