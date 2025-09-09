const express = require("express");
const moduleController = require("../controller/ModuleController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/module-related_to",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Modules", "create"),
  moduleController.createModuleRelatedTo
);
router.put(
  "/module-related_to/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Modules", "update"),
  moduleController.updateModuleRelatedTo
);
router.delete(
  "/module-related_to/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Modules", "delete"),
  moduleController.deleteModuleRelatedTo
);
router.get(
  "/module-related_to",
  authenticateToken,
  moduleController.getModuleRelatedTos
);

module.exports = router;
