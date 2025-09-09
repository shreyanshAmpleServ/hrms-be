// Country Routes
const express = require("express");
const assetsTypeController = require("../controller/assetsTypeController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");
const router = express.Router();

router.post(
  "/assets-type",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Assets Types", "create"),
  assetsTypeController.createAssetsType
);
router.get(
  "/assets-type/:id",
  authenticateToken,
  assetsTypeController.findAssetsTypeById
);
router.put(
  "/assets-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Assets Types", "update"),
  assetsTypeController.updateAssetsType
);
router.delete(
  "/assets-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Assets Types", "delete"),
  assetsTypeController.deleteAssetsType
);
router.get(
  "/assets-type",
  authenticateToken,
  assetsTypeController.getAllAssetsType
);

module.exports = router;
