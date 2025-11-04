const express = require("express");
const router = express.Router();
const employeeKPIController = require("../controller/employeeKPIController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/UploadFileMiddleware");

router.post(
  "/",
  authenticateToken,
  upload.any(),
  employeeKPIController.createEmployeeKPI
);
router.get("/", authenticateToken, employeeKPIController.getAllEmployeeKPI);
router.get("/:id", authenticateToken, employeeKPIController.getEmployeeKPIById);
router.put(
  "/:id",
  authenticateToken,
  upload.any(),
  employeeKPIController.updateEmployeeKPI
);
router.delete(
  "/:id",
  authenticateToken,
  employeeKPIController.deleteEmployeeKPI
);
router.post(
  "/:id/approve",
  authenticateToken,
  employeeKPIController.approveEmployeeKPI
);
router.get(
  "/employee/:employeeId/last",
  authenticateToken,
  employeeKPIController.getLastKPIForEmployee
);
router.get(
  "/employee/:employeeId/component-assignment",
  authenticateToken,
  employeeKPIController.getLastComponentAssignment
);

module.exports = router;
