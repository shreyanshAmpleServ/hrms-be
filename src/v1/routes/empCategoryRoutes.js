// Country Routes
const express = require('express');
const empCategoryController = require('../controller/empCategoryController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/employee-category', authenticateToken, empCategoryController.createEmpCategory);
router.get('/employee-category/:id', authenticateToken, empCategoryController.findEmpCategoryById);
router.put('/employee-category/:id', authenticateToken, empCategoryController.updateEmpCategory);
router.delete('/employee-category/:id', authenticateToken, empCategoryController.deleteEmpCategory);
router.get('/employee-category', authenticateToken, empCategoryController.getAllEmpCategory);

module.exports = router;