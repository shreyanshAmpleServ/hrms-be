// Country Routes
const express = require("express");
const departmentController = require("../controller/departmentController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/department",
  authenticateToken,
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
