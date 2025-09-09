const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const defaultConfigurationController = require("../controller/defaultConfigurationController.js");
const upload = require("../middlewares/UploadFileMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

router.post(
  "/default-configuration",
  upload.fields([
    { name: "company_logo", maxCount: 1 },
    { name: "company_signature", maxCount: 1 },
  ]),
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Default Configuration",
      "update"
    ),
  defaultConfigurationController.createDefaultConfiguration
);

router.get(
  "/default-configuration",
  authenticateToken,
  defaultConfigurationController.getAllDefaultConfiguration
);

router.put(
  "/default-configuration/:id",
  upload.fields([
    { name: "company_logo", maxCount: 1 },
    { name: "company_signature", maxCount: 1 },
  ]),
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Default Configuration",
      "update"
    ),
  defaultConfigurationController.updateDefaultConfiguration
);

router.get(
  "/default-configuration/:id",
  authenticateToken,
  defaultConfigurationController.findDefaultConfiguration
);

router.delete(
  "/default-configuration/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Default Configuration",
      "delete"
    ),
  defaultConfigurationController.deleteDefaultConfiguration
);

router.post(
  "/default-configuration-upsert",
  upload.fields([
    { name: "company_logo", maxCount: 1 },
    { name: "company_signature", maxCount: 1 },
  ]),
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Default Configuration",
      "update"
    ),
  defaultConfigurationController.createOrUpdateDefaultConfiguration
);

module.exports = router;
