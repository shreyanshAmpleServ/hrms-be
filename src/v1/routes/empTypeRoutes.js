// Country Routes
const express = require('express');
const empTypeController = require('../controller/empTypeController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/employment-type', authenticateToken, empTypeController.createEmpType);
router.get('/employment-type/:id', authenticateToken, empTypeController.findEmpTypeById);
router.put('/employment-type/:id', authenticateToken, empTypeController.updateEmpType);
router.delete('/employment-type/:id', authenticateToken, empTypeController.deleteEmpType);
router.get('/employment-type', authenticateToken, empTypeController.getAllEmpType);

module.exports = router;