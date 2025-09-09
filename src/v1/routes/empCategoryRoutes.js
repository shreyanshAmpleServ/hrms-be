const express = require("express");
const empCategoryController = require("../controller/empCategoryController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

const router = express.Router();

router.post(
  "/employee-category",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employee Category", "create"),
  empCategoryController.createEmpCategory
);
router.get(
  "/employee-category/:id",
  authenticateToken,
  empCategoryController.findEmpCategoryById
);
router.put(
  "/employee-category/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employee Category", "update"),
  empCategoryController.updateEmpCategory
);
router.delete(
  "/employee-category/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employee Category", "delete"),
  empCategoryController.deleteEmpCategory
);
router.get(
  "/employee-category",
  authenticateToken,
  empCategoryController.getAllEmpCategory
);

module.exports = router;
