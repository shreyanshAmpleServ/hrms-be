// const express = require("express");
// const EmployeeController = require("../controller/EmployeeController"); // Assuming the controller is named EmployeeController.js
// const { authenticateToken } = require("../middlewares/authMiddleware");
// const upload = require("../middlewares/UploadFileMiddleware");
// const router = express.Router();

// router.post(
//   "/employee",
//   authenticateToken,
//   upload.fields([{ name: "profile_pic", maxCount: 1 }]),

//   EmployeeController.createEmployee
// );

// // Route to get a specific employee by its ID
// router.get(
//   "/employee/:id",
//   authenticateToken,
//   upload.single("profile_pic"),
//   EmployeeController.findEmployeeById
// );

// router.put(
//   "/employee/:id",
//   authenticateToken,
//   upload.fields([{ name: "profile_pic", maxCount: 1 }]),

//   EmployeeController.updateEmployee
// );

// // Route to delete a specific employee by its ID
// router.delete(
//   "/employee/:id",
//   authenticateToken,
//   EmployeeController.deleteEmployee
// );

// // Route to get all employees
// router.get("/employee", authenticateToken, EmployeeController.getAllEmployee);

// // Route to get all employees options
// router.get(
//   "/employee-options",
//   authenticateToken,
//   EmployeeController.employeeOptions
// );

// module.exports = router;
const express = require("express");
const EmployeeController = require("../controller/EmployeeController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/UploadFileMiddleware");

const router = express.Router();

router.post(
  "/employee",
  authenticateToken,
  upload.any(),
  EmployeeController.createEmployee
);

router.get(
  "/employee/:id",
  authenticateToken,
  EmployeeController.findEmployeeById
);

router.put(
  "/employee/:id",
  authenticateToken,
  upload.any(),
  EmployeeController.updateEmployee
);

router.delete(
  "/employee/:id",
  authenticateToken,
  EmployeeController.deleteEmployee
);

router.get("/employee", authenticateToken, EmployeeController.getAllEmployee);

router.get(
  "/employee-options",
  authenticateToken,
  EmployeeController.employeeOptions
);

module.exports = router;
