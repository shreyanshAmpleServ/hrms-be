// Country Routes
const express = require('express');
const permissionsController = require('../controller/roleModulePermissionController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/permissions', authenticateToken, permissionsController.createPermission);
// router.get('/permissions/:id', authenticateToken, permissionsController.getCountryById);
// router.put('/permissions/:id', authenticateToken, permissionsController.updateCountry);
// router.delete('/permissions/:id', authenticateToken, permissionsController.deleteCountry);
router.get('/permissions', authenticateToken, permissionsController.getAllPermission);

module.exports = router;