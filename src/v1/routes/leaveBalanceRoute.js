const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  getLeaveBalanceController,
  createLeaveBalanceController,
  updateLeaveBalanceController,
  deleteLeaveBalanceController,
  getAllLeaveBalancesController,
  findLeaveBalanceByIdController,
  findLeaveBalanceByEmployeeIdController,
} = require("../controller/leaveBalanceController");

router.post("/leave-balance", authenticateToken, createLeaveBalanceController);
router.put(
  "/leave-balance/:id",
  authenticateToken,
  updateLeaveBalanceController
);
router.delete(
  "/leave-balance/:id",
  authenticateToken,
  deleteLeaveBalanceController
);
router.get("/leave-balance", authenticateToken, getAllLeaveBalancesController);
router.get(
  "/leave-balance/:id",
  authenticateToken,
  findLeaveBalanceByIdController
);

router.get(
  "/leave-balance-by-employee",
  authenticateToken,
  getLeaveBalanceController
);

router.get(
  "/leave-balance-by-employee/:employeeId",
  authenticateToken,
  findLeaveBalanceByEmployeeIdController
);

module.exports = router;
