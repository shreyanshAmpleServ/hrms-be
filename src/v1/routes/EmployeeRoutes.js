const express = require("express");
const EmployeeController = require("../controller/EmployeeController"); // Assuming the controller is named EmployeeController.js
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/UploadFileMiddleware");

const router = express.Router();

router.post(
  "/employee",
  authenticateToken,
  upload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "nssf_file", maxCount: 1 },
    { name: "nida_file", maxCount: 1 },
  ]),
  (req, res, next) => {
    console.log("Files received:", req.files);
    if (req.files.profile_pic) {
      console.log(
        "Profile pic buffer size:",
        req.files.profile_pic[0].buffer.length
      );
    }
    console.log("Body data:", req.body);
    next();
  },
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
  upload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "nssf_file", maxCount: 1 },
    { name: "nida_file", maxCount: 1 },
  ]),
  (req, res, next) => {
    console.log("Files received:", req.files);
    if (req.files.profile_pic) {
      console.log(
        "Profile pic buffer size:",
        req.files.profile_pic[0].buffer.length
      );
    }
    console.log("Body data:", req.body);
    next();
  },
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
