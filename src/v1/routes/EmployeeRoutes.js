const express = require("express");
const EmployeeController = require("../controller/EmployeeController"); // Assuming the controller is named EmployeeController.js
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/UploadFileMiddleware");

const router = express.Router();

// Route to create a new employee
router.post(
  "/employee",
  authenticateToken,
  upload.single("profile_pic"),
  EmployeeController.createEmployee
);

// Route to get a specific employee by its ID
router.get(
  "/employee/:id",
  authenticateToken,
  upload.single("profile_pic"),
  EmployeeController.findEmployeeById
);

// Route to update an existing employee by its ID
router.put(
  "/employee/:id",
  authenticateToken,
  upload.single("profile_pic"),
  EmployeeController.updateEmployee
);

// Route to delete a specific employee by its ID
router.delete(
  "/employee/:id",
  authenticateToken,
  upload.single("profile_pic"),
  EmployeeController.deleteEmployee
);

// Route to get all employees
router.get("/employee", authenticateToken, EmployeeController.getAllEmployee);

// Route to get all employees options
router.get(
  "/employee-options",
  authenticateToken,
  EmployeeController.employeeOptions
);

module.exports = router;
