const express = require("express");
const companyController = require("../controller/companyMasterController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/company",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Company Master", "create"),
  companyController.createCompany
);

router.put(
  "/company/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Company Master", "update"),
  companyController.updateCompany
);

router.get("/company/:id", authenticateToken, companyController.getCompanyById);
router.get("/company", authenticateToken, companyController.getAllCompanies);
router.delete(
  "/company/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Company Master", "delete"),
  companyController.deleteCompany
);

module.exports = router;
