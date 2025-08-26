const express = require("express");
const BasicPayController = require("../controller/BasicPayController"); // Assuming the controller is named BasicPayController.js
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/UploadFileMiddleware");

const router = express.Router();

router.post(
  "/basic-pay/import",
  authenticateToken,
  upload.single("file"),
  BasicPayController.importFromExcel
);
router.post("/basic-pay", authenticateToken, BasicPayController.createBasicPay);

router.get(
  "/basic-pay/:id",
  authenticateToken,
  BasicPayController.findBasicPayById
);

// Route to update an existing Basic Pay by its ID
router.put(
  "/basic-pay/:id",
  authenticateToken,
  BasicPayController.updateBasicPay
);

// Route to delete a specific Basic Pay by its ID
router.delete(
  "/basic-pay/:id",
  authenticateToken,
  BasicPayController.deleteBasicPay
);

// Route to get all Basic Pays
router.get("/basic-pay", authenticateToken, BasicPayController.getAllBasicPay);

module.exports = router;
