// Country Routes
const express = require("express");
const payComponentController = require("../controller/payComponentController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/pay-component",
  authenticateToken,
  payComponentController.createPayComponent,
);
router.get(
  "/pay-component/:id",
  authenticateToken,
  payComponentController.findPayComponentById,
);

router.put(
  "/pay-component/:id",
  authenticateToken,
  payComponentController.updatePayComponent,
);

router.put(
  "/update-all",
  authenticateToken,
  payComponentController.updatePayOneTimeForColumnComponent,
);

router.delete(
  "/pay-component/:id",
  authenticateToken,
  payComponentController.deletePayComponent,
);
router.get(
  "/pay-component",
  authenticateToken,
  payComponentController.getAllPayComponent,
);

router.get(
  "/pay-component-options",
  authenticateToken,
  payComponentController.getPayComponentOptions,
);

router.get(
  "/p09-report",
  authenticateToken,
  payComponentController.generateP09Report,
);

router.get(
  "/sdl-report",
  authenticateToken,
  payComponentController.generateSDLReport,
);

router.get(
  "/p10-report",
  authenticateToken,
  payComponentController.generateP10Report,
);
router.get(
  "/payroll-report",
  authenticateToken,
  payComponentController.generatePayrollSummaryReport,
);

router.get(
  "/payroll-summary-report",
  authenticateToken,
  payComponentController.generatePayrollSummaryReport,
);

router.get(
  "/nssf-report",
  authenticateToken,
  payComponentController.generateNSSFReport,
);

router.get(
  "/wcf-report",
  authenticateToken,
  payComponentController.generateWCFReport,
);

module.exports = router;
