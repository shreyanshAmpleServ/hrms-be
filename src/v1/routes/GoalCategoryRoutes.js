const express = require("express");
const GoalCategoryController = require("../controller/GoalCategoryController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/goal-category",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Goal Category Master",
      "create"
    ),
  GoalCategoryController.createGoalCategory
);
router.get(
  "/goal-category/:id",
  authenticateToken,
  GoalCategoryController.findGoalCategoryById
);
router.put(
  "/goal-category/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Goal Category Master",
      "update"
    ),
  GoalCategoryController.updateGoalCategory
);
router.delete(
  "/goal-category/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Goal Category Master",
      "delete"
    ),
  GoalCategoryController.deleteGoalCategory
);
router.get(
  "/goal-category",
  authenticateToken,
  GoalCategoryController.getAllGoalCategory
);

module.exports = router;
