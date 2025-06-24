const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const medicalRecordController = require("../controller/medicalRecordController.js");
const upload = require("../middlewares/uploadMiddleware.js");

router.post(
  "/medical-record",
  upload.single("document_path"),
  upload.single("prescription_path"),
  authenticateToken,
  medicalRecordController.createMedicalRecord
);

router.get(
  "/medical-record",
  authenticateToken,
  medicalRecordController.getAllMedicalRecord
);

router.put(
  "/medical-record/:id",
  upload.single("document_path"),
  upload.single("prescription_path"),
  authenticateToken,
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
  medicalRecordController.deleteMedicalRecord
);
module.exports = router;
