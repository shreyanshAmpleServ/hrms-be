const express = require("express");
const router = express.Router();
const travelExpenseController = require("../controller/travelExpenseController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/uploadMiddleware.js");

// Create travel expense routes
router.post(
  "/travel-expense",
  authenticateToken,
  upload.single("attachment_path"),
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
  upload.single("attachment_path"),
  travelExpenseController.updateTravelExpense
);

// Delete  travel expense by ID routes
router.delete(
  "/travel-expense/:id",
  authenticateToken,
  travelExpenseController.deleteTravelExpense
);

router.patch(
  "/travel-expense/:id/status",
  authenticateToken,
  travelExpenseController.updateTravelExpenseStatus
);

module.exports = router;
