const express = require("express");
const router = express.Router();
const alertWorkflowController = require("../controller/alertWorkflowController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.post(
  "/alert-workflow",
  authenticateToken,
  alertWorkflowController.createAlertWorkflow
);

router.get(
  "/alert-workflow",
  authenticateToken,
  alertWorkflowController.getAllAlertWorkflows
);

router.get(
  "/alert-workflow/:id",
  authenticateToken,
  alertWorkflowController.getAlertWorkflowById
);

router.put(
  "/alert-workflow/:id",
  authenticateToken,
  alertWorkflowController.updateAlertWorkflow
);

router.delete(
  "/alert-workflow/:id",
  authenticateToken,
  alertWorkflowController.deleteAlertWorkflow
);

router.post(
  "/alert-workflow/:id/trigger",
  authenticateToken,
  alertWorkflowController.triggerAlertWorkflow
);

module.exports = router;
