const express = require("express");
const router = express.Router();
const employeeExperienceController = require("../controller/employeeExperienceController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create employee review routes
router.post(
  "/employee-experience",
  authenticateToken,

  employeeExperienceController.createEmployeeExperience
);

// Get all employee reviews routes
router.get(
  "/employee-experience",
  authenticateToken,
  employeeExperienceController.getAllEmployeeExperience
);

// Get a single employee review by ID
router.get(
  "/employee-experience/:id",
  authenticateToken,
  employeeExperienceController.findEmployeeExperience
);

// Update a employee review by ID
router.put(
  "/employee-experience/:id",
  authenticateToken,
  employeeExperienceController.updateEmployeeExperience
);

// Delete  employee review by ID
router.delete(
  "/employee-experience/:id",
  authenticateToken,
  employeeExperienceController.deleteEmployeeExperience
);

module.exports = router;
