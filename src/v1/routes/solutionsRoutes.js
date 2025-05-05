const express = require('express');
const solutionsController = require('../controller/solutionsController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/solutions', authenticateToken,solutionsController.createSolutions);
router.get('/solutions/:id', authenticateToken, solutionsController.findSolutionById);
router.put('/solutions/:id',authenticateToken, solutionsController.updateSolutions);
router.delete('/solutions/:id', authenticateToken, solutionsController.deleteSolution);
router.get('/solutions', authenticateToken, solutionsController.getAllSolution);

module.exports = router;
