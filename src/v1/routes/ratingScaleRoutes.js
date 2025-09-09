// Country Routes
const express = require("express");
const ratingScaleController = require("../controller/ratingScaleController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  setupNotificationMiddleware,
} = require("../middlewares/notificationMiddleware.js");

const router = express.Router();

router.post(
  "/rating-scale",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Rating Scale Master",
      "create"
    ),
  ratingScaleController.createRatingScale
);
router.get(
  "/rating-scale/:id",
  authenticateToken,
  ratingScaleController.findRatingScaleById
);
router.put(
  "/rating-scale/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Rating Scale Master",
      "update"
    ),
  ratingScaleController.updateRatingScale
);
router.delete(
  "/rating-scale/:id",
  authenticateToken,
  (req, res, next) =>
    setupNotificationMiddleware(
      req,
      res,
      next,
      "Rating Scale Master",
      "delete"
    ),
  ratingScaleController.deleteRatingScale
);
router.get(
  "/rating-scale",
  authenticateToken,
  ratingScaleController.getAllRatingScale
);

module.exports = router;
