const express = require("express");
const router = express.Router();
const employeeEducationController = require("../controller/employeeEducationController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

// Create employee routes
router.post(
  "/employee-education",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employee", "create"),
  employeeEducationController.createEmployeeEducation
);

// Get all employee routes
router.get(
  "/employee-education",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employee", "read"),
  employeeEducationController.getAllEmployeeEducation
);

// Get a single employee by ID
router.get(
  "/employee-education/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employee", "read"),
  employeeEducationController.findEmployeeEducation
);

// Update a employee by ID
router.put(
  "/employee-education/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employee", "update"),
  employeeEducationController.updateEmployeeEducation
);

// Delete  employee by ID
router.delete(
  "/employee-education/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employee", "delete"),
  employeeEducationController.deleteEmployeeEducation
);

module.exports = router;
