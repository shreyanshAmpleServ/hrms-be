const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const medicalRecordController = require("../controller/medicalRecordController.js");
const upload = require("../middlewares/UploadFileMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

router.post(
  "/medical-record",
  upload.fields([
    { name: "document_path", maxCount: 1 },
    { name: "prescription_path", maxCount: 1 },
  ]),
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Medical Record", "create"),
  medicalRecordController.createMedicalRecord
);

router.get(
  "/medical-record",
  authenticateToken,
  medicalRecordController.getAllMedicalRecord
);

router.put(
  "/medical-record/:id",
  upload.fields([
    { name: "document_path", maxCount: 1 },
    { name: "prescription_path", maxCount: 1 },
  ]),
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Medical Record", "update"),
  medicalRecordController.updateMedicalRecord
);

router.get(
  "/medical-record/:id",
  authenticateToken,
  medicalRecordController.findMedicalRecord
);

router.delete(
  "/medical-record/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "Medical Record", "delete"),
  medicalRecordController.deleteMedicalRecord
);
module.exports = router;
