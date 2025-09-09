const express = require("express");
const departmentController = require("../controller/departmentController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/department",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Department", "create"),
  departmentController.createDepartment
);
router.get(
  "/department/:id",
  authenticateToken,
  departmentController.findDepartmentById
);
router.put(
  "/department/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Department", "update"),
  departmentController.updateDepartment
);
// router.delete(
//   "/department/:id",
//   authenticateToken,
//   departmentController.deleteDepartment
// );

router.delete(
  "/department",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Department", "delete"),
  departmentController.deleteDepartment
);

router.get(
  "/department",
  authenticateToken,
  departmentController.getAllDepartments
);
router.get(
  "/department-options",
  authenticateToken,
  departmentController.getDepartmentOptions
);

module.exports = router;
