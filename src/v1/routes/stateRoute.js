const express = require("express");
const stateController = require("../controller/stateController");
const { authenticateToken } = require("../middlewares/authMiddleware"); // Import the state controller
const router = express.Router();

// Get all states
router.get("/states", authenticateToken, stateController.getAllStates);

// Get state by ID
router.get("/states/:id", authenticateToken, stateController.getStateById);

// Create a new state
router.post(
  "/states",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "State", "create"),
  stateController.createState
);

// Update an existing state
router.put(
  "/states/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "State", "update"),
  stateController.updateState
);

// Delete a state
router.delete(
  "/states/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "State", "delete"),
  stateController.deleteState
);

module.exports = router;
