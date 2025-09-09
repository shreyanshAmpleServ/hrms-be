const express = require("express");
const BasicPayController = require("../controller/BasicPayController"); // Assuming the controller is named BasicPayController.js
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/UploadFileMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/basic-pay/import",
  authenticateToken,
  upload.single("file"),
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Component Assignment",
      "import"
    ),
  BasicPayController.importFromExcel
);

router.get(
  "/basic-pay/sample-excel",
  authenticateToken,
  BasicPayController.downloadSampleExcel
);
router.post(
  "/basic-pay/import/preview",
  authenticateToken,
  upload.single("file"),

  BasicPayController.previewExcel
);

router.post(
  "/basic-pay/import/preview/download",
  authenticateToken,
  upload.single("file"),
  BasicPayController.downloadPreviewExcel
);
router.post(
  "/basic-pay",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Component Assignment",
      "create"
    ),
  BasicPayController.createBasicPay
);

router.get(
  "/basic-pay/:id",
  authenticateToken,
  BasicPayController.findBasicPayById
);

// Route to update an existing Basic Pay by its ID
router.put(
  "/basic-pay/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Component Assignment",
      "update"
    ),
  BasicPayController.updateBasicPay
);

// Route to delete a specific Basic Pay by its ID
router.delete(
  "/basic-pay/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Component Assignment",
      "delete"
    ),
  BasicPayController.deleteBasicPay
);

// Route to get all Basic Pays
router.get("/basic-pay", authenticateToken, BasicPayController.getAllBasicPay);

module.exports = router;
