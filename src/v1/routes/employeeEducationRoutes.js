const express = require("express");
const router = express.Router();
const employeeEducationController = require("../controller/employeeEducationController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create employee education routes
router.post(
  "/employee-education",
  authenticateToken,
  employeeEducationController.createEmployeeEducation
);

// Get all employee education routes
router.get(
  "/employee-education",
  authenticateToken,
  employeeEducationController.getAllEmployeeEducation
);

// Get a single employee education by ID routes
router.get(
  "/employee-education/:id",
  authenticateToken,
  employeeEducationController.findEmployeeEducation
);

// Update a employee education by ID routes
router.put(
  "/employee-education/:id",
  authenticateToken,
  employeeEducationController.updateEmployeeEducation
);

// Delete  employee education by ID routes
router.delete(
  "/employee-education/:id",
  authenticateToken,
  employeeEducationController.deleteEmployeeEducation
);

module.exports = router;
