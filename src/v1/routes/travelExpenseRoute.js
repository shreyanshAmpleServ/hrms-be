const express = require("express");
const router = express.Router();
const travelExpenseController = require("../controller/travelExpenseController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create travel expense routes
router.post(
  "/travel-expense",
  authenticateToken,
  travelExpenseController.createTravelExpense
);

// Get all travel expenses routes
router.get(
  "/travel-expense",
  authenticateToken,
  travelExpenseController.getAllTravelExpenses
);

// Get a single travel expense by ID
router.get(
  "/travel-expense/:id",
  authenticateToken,
  travelExpenseController.findTravelExpense
);

// Update a travel expense by ID
router.put(
  "/travel-expense/:id",
  authenticateToken,
  travelExpenseController.updateTravelExpense
);

// Delete  travel expense by ID routes
router.delete(
  "/travel-expense/:id",
  authenticateToken,
  travelExpenseController.deleteTravelExpense
);

module.exports = router;
