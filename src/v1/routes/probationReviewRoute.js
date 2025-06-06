const express = require("express");
const router = express.Router();
const probationReviewController = require("../controller/probationReviewController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create probation review  routes
router.post(
  "/probation-review",
  authenticateToken,

  probationReviewController.createProbationReview
);

// Get all probation reviews routes
router.get(
  "/probation-review",
  authenticateToken,
  probationReviewController.getAllProbationReview
);

// Get a single probation review by ID routes
router.get(
  "/probation-review/:id",
  authenticateToken,
  probationReviewController.findProbationReview
);

// Update a probation review by ID routes
router.put(
  "/probation-review/:id",
  authenticateToken,
  probationReviewController.updateProbationReview
);

// Delete  probation review by ID routes
router.delete(
  "/probation-review/:id",
  authenticateToken,
  probationReviewController.deleteProbationReview
);

module.exports = router;
