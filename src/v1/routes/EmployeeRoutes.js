const express = require("express");
const EmployeeController = require("../controller/EmployeeController"); // Assuming the controller is named EmployeeController.js
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/UploadFileMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");
const router = express.Router();

router.post(
  "/employee",
  authenticateToken,
  upload.fields([{ name: "profile_pic", maxCount: 1 }]),
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employee", "create"),
  EmployeeController.createEmployee
);

// Route to get a specific employee by its ID
router.get(
  "/employee/:id",
  authenticateToken,
  upload.single("profile_pic"),
  EmployeeController.findEmployeeById
);

router.put(
  "/employee/:id",
  authenticateToken,
  upload.fields([{ name: "profile_pic", maxCount: 1 }]),
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employee", "update"),
  EmployeeController.updateEmployee
);

// Route to delete a specific employee by its ID
router.delete(
  "/employee/:id",
  authenticateToken,
  upload.single("profile_pic"),
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employee", "delete"),
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
