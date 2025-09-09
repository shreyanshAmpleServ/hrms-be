const express = require("express");
const empTypeController = require("../controller/empTypeController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/employment-type",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employment Type", "create"),
  empTypeController.createEmpType
);
router.get(
  "/employment-type/:id",
  authenticateToken,
  empTypeController.findEmpTypeById
);
router.put(
  "/employment-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employment Type", "update"),
  empTypeController.updateEmpType
);
router.delete(
  "/employment-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Employment Type", "delete"),
  empTypeController.deleteEmpType
);
router.get(
  "/employment-type",
  authenticateToken,
  empTypeController.getAllEmpType
);

module.exports = router;
