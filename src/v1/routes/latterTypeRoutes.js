// Country Routes
const express = require("express");
const latterTypeController = require("../controller/latterTypeController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

const router = express.Router();

router.post(
  "/latter-type",
  authenticateToken,
  upload.single("template_path"),
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Latter Type", "create"),
  latterTypeController.createLatterType
);
router.get(
  "/latter-type/:id",
  authenticateToken,
  latterTypeController.findLatterTypeById
);
router.put(
  "/latter-type/:id",
  authenticateToken,
  upload.single("template_path"),
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Latter Type", "update"),
  latterTypeController.updateLatterType
);
router.delete(
  "/latter-type/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Latter Type", "delete"),
  latterTypeController.deleteLatterType
);
router.get(
  "/latter-type",
  authenticateToken,
  latterTypeController.getAllLatterType
);

module.exports = router;
