const express = require("express");
const applicationSourceController = require("../controller/applicationSourceController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post(
  "/application-source",
  authenticateToken,
  applicationSourceController.createApplicationSource
);

router.get(
  "/application-source/:id",
  authenticateToken,
  applicationSourceController.findApplicationSourceById
);

router.put(
  "/application-source/:id",
  authenticateToken,
  applicationSourceController.updateApplicationSource
);

router.delete(
  "/application-source/:id",
  authenticateToken,
  applicationSourceController.deleteApplicationSource
);

router.get(
  "/application-source",
  authenticateToken,
  applicationSourceController.getAllApplicationSource
);

module.exports = router;
