// Country Routes
const express = require("express");
const salaryStructureController = require("../controller/salaryStructureController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/salary-structure",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Salary Structure", "create"),
  salaryStructureController.createSalaryStructure
);
router.get(
  "/salary-structure/:id",
  authenticateToken,
  salaryStructureController.findSalaryStructureById
);
router.put(
  "/salary-structure/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Salary Structure", "update"),
  salaryStructureController.updateSalaryStructure
);
router.delete(
  "/salary-structure/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Salary Structure", "delete"),
  salaryStructureController.deleteSalaryStructure
);
router.get(
  "/salary-structure",
  authenticateToken,
  salaryStructureController.getAllSalaryStructure
);

module.exports = router;
