const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const defaultConfigurationController = require("../controller/defaultConfigurationController.js");
const upload = require("../middlewares/UploadFileMiddleware.js");

router.post(
  "/default-configuration",
  upload.fields([
    { name: "company_logo", maxCount: 1 },
    { name: "company_signature", maxCount: 1 },
  ]),
  authenticateToken,
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
  defaultConfigurationController.deleteDefaultConfiguration
);
module.exports = router;
