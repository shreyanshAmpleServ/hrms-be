const express = require("express");
const hrLetterController = require("../controller/hrLetterController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/UploadFileMiddleware.js");
const router = express.Router();

router.post(
  "/hr-letter",
  upload.single("document_path"),
  authenticateToken,
  hrLetterController.createhrLetter
);

router.get(
  "/hr-letter/:id",
  authenticateToken,
  hrLetterController.findhrLetterById
);

router.put(
  "/hr-letter/:id",
  upload.single("document_path"),
  authenticateToken,
  hrLetterController.updatehrLetter
);

router.delete(
  "/hr-letter/:id",
  authenticateToken,
  hrLetterController.deletehrLetter
);

router.get("/hr-letter", authenticateToken, hrLetterController.getAllhrLetter);

router.patch(
  "/hr-letter/:id/status",
  authenticateToken,
  hrLetterController.updatehrLetterStatus
);

module.exports = router;
