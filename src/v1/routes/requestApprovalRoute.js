const express = require("express");
const router = express.Router();
const requestApprovalController = require("../controller/requestApprovalController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

router.post(
  "/request-approval",
  authenticateToken,
  requestApprovalController.createRequestApproval
);
router.get(
  "/request-approval/:id",
  authenticateToken,
  requestApprovalController.findRequestApproval
);
router.get(
  "/request-approval",
  authenticateToken,
  requestApprovalController.getAllRequestApproval
);
router.put(
  "/request-approval/:id",
  authenticateToken,
  requestApprovalController.updateRequestApproval
);
router.delete(
  "/request-approval/:id",
  authenticateToken,
  requestApprovalController.deleteRequestApproval
);

module.exports = router;
