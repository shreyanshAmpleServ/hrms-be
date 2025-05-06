// Country Routes
const express = require('express');
const empTypeController = require('../controller/empTypeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/employee-type', authenticateToken, empTypeController.createEmpType);
router.get('/employee-type/:id', authenticateToken, empTypeController.findEmpTypeById);
router.put('/employee-type/:id', authenticateToken, empTypeController.updateEmpType);
router.delete('/employee-type/:id', authenticateToken, empTypeController.deleteEmpType);
router.get('/employee-type', authenticateToken, empTypeController.getAllEmpType);

module.exports = router;