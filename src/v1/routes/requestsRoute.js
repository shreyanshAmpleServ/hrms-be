const express = require("express");
const router = express.Router();
const requestsController = require("../controller/requestsController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

router.post("/requests", authenticateToken, requestsController.createRequest);
router.get("/requests/:id", authenticateToken, requestsController.findRequests);
router.get("/requests", authenticateToken, requestsController.getAllRequests);
router.put(
  "/requests/:id",
  authenticateToken,
  requestsController.updateRequests
);
router.delete(
  "/requests/:id",
  authenticateToken,
  requestsController.deleteRequests
);

router.post("/requests/action", requestsController.takeActionOnRequest);
module.exports = router;
