const express = require("express");
const branchController = require("../controller/branchController");
const { authenticateToken } = require("../middlewares/authMiddleware"); // Import the branch controller
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

// Get all branchs
router.get("/branch", authenticateToken, branchController.getAllBranch);

// Get branch by ID
router.get("/branch/:id", authenticateToken, branchController.getBranchById);

// Create a new branch
router.post(
  "/branch",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Branch", "create"),
  branchController.createBranch
);

// Update an existing branch
router.put(
  "/branch/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Branch", "update"),
  branchController.updateBranch
);

// Delete a branch
router.delete(
  "/branch/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Branch", "delete"),
  branchController.deleteBranch
);

module.exports = router;
