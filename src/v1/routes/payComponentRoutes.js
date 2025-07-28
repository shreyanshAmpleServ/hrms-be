// Country Routes
const express = require("express");
const payComponentController = require("../controller/payComponentController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/pay-component",
  authenticateToken,
  payComponentController.createPayComponent
);
router.get(
  "/pay-component/:id",
  authenticateToken,
  payComponentController.findPayComponentById
);
// router.put(
//   "/pay-component/:id",
//   authenticateToken,
//   payComponentController.updatePayComponent
// );

router.put(
  "/update-all",
  authenticateToken,
  payComponentController.updatePayComponent
);

router.delete(
  "/pay-component/:id",
  authenticateToken,
  payComponentController.deletePayComponent
);
router.get(
  "/pay-component",
  authenticateToken,
  payComponentController.getAllPayComponent
);

router.get(
  "/pay-component-options",
  authenticateToken,
  payComponentController.getPayComponentOptions
);
module.exports = router;
