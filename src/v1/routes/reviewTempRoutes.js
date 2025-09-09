// Country Routes
const express = require("express");
const reviewTempController = require("../controller/reviewTempController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware");

const router = express.Router();

router.post(
  "/review-template",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Review Template Master",
      "create"
    ),
  reviewTempController.createReviewTemp
);
router.get(
  "/review-template/:id",
  authenticateToken,
  reviewTempController.findReviewTempById
);
router.put(
  "/review-template/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Review Template Master",
      "update"
    ),
  reviewTempController.updateReviewTemp
);
router.delete(
  "/review-template/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Review Template Master",
      "delete"
    ),
  reviewTempController.deleteReviewTemp
);
router.get(
  "/review-template",
  authenticateToken,
  reviewTempController.getAllReviewTemp
);

module.exports = router;
