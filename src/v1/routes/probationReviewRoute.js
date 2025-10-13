const express = require("express");
const router = express.Router();
const probationReviewController = require("../controller/probationReviewController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

router.post(
  "/probation-review",
  authenticateToken,
  probationReviewController.createProbationReview
);

router.get(
  "/probation-review",
  authenticateToken,
  probationReviewController.getAllProbationReview
);

router.get(
  "/probation-review/:id",
  authenticateToken,
  probationReviewController.findProbationReview
);

router.put(
  "/probation-review/:id",
  authenticateToken,
  probationReviewController.updateProbationReview
);

router.delete(
  "/probation-review/:id",
  authenticateToken,
  probationReviewController.deleteProbationReview
);

module.exports = router;
