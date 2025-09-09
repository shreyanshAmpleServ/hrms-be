const express = require("express");
const router = express.Router();
const goalSheetController = require("../controller/goalSheetController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");
// Create goal sheet routes
router.post(
  "/goal-sheet",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Goal Sheet Assignment",
      "create"
    ),
  goalSheetController.createGoalSheet
);

// Get all goal sheets routes
router.get(
  "/goal-sheet",
  authenticateToken,
  goalSheetController.getAllGoalSheet
);

// Get a single goal sheet by ID routes
router.get(
  "/goal-sheet/:id",
  authenticateToken,
  goalSheetController.findGoalSheet
);

// Update a goal sheet by ID routes
router.put(
  "/goal-sheet/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Goal Sheet Assignment",
      "update"
    ),
  goalSheetController.updateGoalSheet
);

// Delete  goal sheet by ID routes
router.delete(
  "/goal-sheet/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Goal Sheet Assignment",
      "delete"
    ),
  goalSheetController.deleteGoalSheet
);

router.patch(
  "/goal-sheet/:id/status",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Goal Sheet Assignment",
      "update"
    ),
  goalSheetController.updateGoalSheetStatus
);
module.exports = router;
