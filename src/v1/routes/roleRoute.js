const express = require('express');
const roleController = require('../controller/roleController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/roles', authenticateToken, roleController.createRole);
router.get('/roles/:id', authenticateToken, roleController.getRoleById);
router.put('/roles/:id', authenticateToken, roleController.updateRole);
router.delete('/roles/:id', authenticateToken, roleController.deleteRole);
router.get('/roles', authenticateToken, roleController.getAllRoles);

module.exports = router;
