const express = require("express");
const router = express.Router();
const approvalWorkFlowController = require("../controller/approvalWorkFlowController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

router.post(
  "/approval-workflow",
  authenticateToken,
  approvalWorkFlowController.createApprovalWorkFlow
);

router.get(
  "/approval-workflow/:id",
  authenticateToken,
  approvalWorkFlowController.findApprovalWorkFlow
);

router.get(
  "/approval-workflow",
  authenticateToken,
  approvalWorkFlowController.getAllApprovalWorkFlow
);

router.post(
  "/approval-workflow-upsert",
  authenticateToken,
  approvalWorkFlowController.updateApprovalWorkFlow
);

router.delete(
  "/approval-workflow/:requestType",
  authenticateToken,
  approvalWorkFlowController.deleteApprovalWorkFlow
);

router.get(
  "/approval/get-all-workflow",
  authenticateToken,
  approvalWorkFlowController.getAllApprovalWorkFlowByRequest
);

router.get(
  "/department-workflows",
  authenticateToken,
  approvalWorkFlowController.getDepartmentWorkflows
);

router.get(
  "/departments-with-workflows/:requestType",
  authenticateToken,
  approvalWorkFlowController.getDepartmentsWithWorkflows
);

router.get(
  "/workflow-summary",
  authenticateToken,
  approvalWorkFlowController.getWorkflowSummary
);

router.post(
  "/validate-workflow",
  authenticateToken,
  approvalWorkFlowController.validateWorkflow
);

module.exports = router;
