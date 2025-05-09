// Country Routes
const express = require('express');
const GoalCategoryController = require('../controller/GoalCategoryController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/goal-category', authenticateToken, GoalCategoryController.createGoalCategory);
router.get('/goal-category/:id', authenticateToken, GoalCategoryController.findGoalCategoryById);
router.put('/goal-category/:id', authenticateToken, GoalCategoryController.updateGoalCategory);
router.delete('/goal-category/:id', authenticateToken, GoalCategoryController.deleteGoalCategory);
router.get('/goal-category', authenticateToken, GoalCategoryController.getAllGoalCategory);

module.exports = router;