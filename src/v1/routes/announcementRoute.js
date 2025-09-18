const express = require("express");
const router = express.Router();
const announcementController = require("../controller/announcementController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/UploadFileMiddleware.js");

router.post(
  "/announcement",
  upload.fields([{ name: "announcement_image", maxCount: 1 }]),
  authenticateToken,
  announcementController.createAnnouncement
);

router.get(
  "/announcement",
  authenticateToken,
  announcementController.getAllAnnouncement
);

router.get(
  "/announcement/:id",
  authenticateToken,
  announcementController.findAnnouncement
);

router.put(
  "/announcement/:id",
  upload.fields([{ name: "announcement_image", maxCount: 1 }]),
  authenticateToken,
  announcementController.updateAnnouncement
);

router.delete(
  "/announcement/:id",
  authenticateToken,
  announcementController.deleteAnnouncement
);

router.post(
  "/announcement/:id/display",
  authenticateToken,
  announcementController.processAnnouncementNow
);

router.get(
  "/employee-announcement",
  authenticateToken,
  announcementController.getMyAnnouncement
);

router.get(
  "/scheduled-jobs-status",
  authenticateToken,
  announcementController.getScheduledJobsStatus
);

router.get("/announcements", announcementController.getPublicAnnouncements);
router.get(
  "/announcements/:id",
  announcementController.getPublicAnnouncementById
);

module.exports = router;
