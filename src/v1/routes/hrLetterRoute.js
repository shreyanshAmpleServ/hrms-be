const express = require("express");
const hrLetterController = require("../controller/hrLetterController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/UploadFileMiddleware.js");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");
const router = express.Router();

router.post(
  "/hr-letter",
  upload.single("document_path"),
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "HR Letters", "create"),
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
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "HR Letters", "update"),
  hrLetterController.updatehrLetter
);

router.delete(
  "/hr-letter/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "HR Letters", "delete"),
  hrLetterController.deletehrLetter
);

router.get("/hr-letter", authenticateToken, hrLetterController.getAllhrLetter);

router.patch(
  "/hr-letter/:id/status",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(req, res, next, "HR Letters", "update"),
  hrLetterController.updatehrLetterStatus
);

module.exports = router;
