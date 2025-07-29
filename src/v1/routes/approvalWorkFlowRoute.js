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
router.put(
  "/approval-workflow/:id",
  authenticateToken,
  approvalWorkFlowController.updateApprovalWorkFlow
);
router.delete(
  "/approval-workflow/:id",
  authenticateToken,
  approvalWorkFlowController.deleteApprovalWorkFlow
);

module.exports = router;
