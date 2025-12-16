const express = require("express");
const router = express.Router();
const employeeKPIController = require("../controller/employeeKPIController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/UploadFileMiddleware");
const { processKPIComponentAssignments } = require("../../cronjobs.js");

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

router.post("/test/process-kpi-assignments", async (req, res) => {
  try {
    console.log("Manual trigger: Processing KPI component assignments...");
    await processKPIComponentAssignments();
    res.json({
      success: true,
      message: "KPI component assignments processed successfully",
    });
  } catch (error) {
    console.error("Manual trigger error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
module.exports = router;
