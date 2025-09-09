// Country Routes
const express = require("express");
const PFController = require("../controller/PFController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/provident_fund",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Provident Fund", "create"),
  PFController.createPF
);
router.get("/provident_fund/:id", authenticateToken, PFController.findPFById);
router.put(
  "/provident_fund/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Provident Fund", "update"),
  PFController.updatePF
);
router.delete(
  "/provident_fund/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Provident Fund", "delete"),
  PFController.deletePF
);
router.get("/provident_fund", authenticateToken, PFController.getAllPF);

module.exports = router;
