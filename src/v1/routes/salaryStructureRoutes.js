// Country Routes
const express = require('express');
const salaryStructureController = require('../controller/salaryStructureController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/salary-structure', authenticateToken, salaryStructureController.createSalaryStructure);
router.get('/salary-structure/:id', authenticateToken, salaryStructureController.findSalaryStructureById);
router.put('/salary-structure/:id', authenticateToken, salaryStructureController.updateSalaryStructure);
router.delete('/salary-structure/:id', authenticateToken, salaryStructureController.deleteSalaryStructure);
router.get('/salary-structure', authenticateToken, salaryStructureController.getAllSalaryStructure);

module.exports = router;