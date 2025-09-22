const express = require("express");
const router = express.Router();
const paymentRecoveryController = require("../controllers/paymentRecoveryController");

// Recovery CRUD routes
router.post("/", paymentRecoveryController.createRecovery);
router.get("/", paymentRecoveryController.getRecoveries);
router.get("/stats", paymentRecoveryController.getRecoveryStats);
router.get("/employees", paymentRecoveryController.getEmployeeList);
router.get(
  "/employee/:employeeId/pending",
  paymentRecoveryController.getPendingRecoveries
);
router.get("/:id", paymentRecoveryController.getRecoveryById);
router.put("/:id", paymentRecoveryController.updateRecovery);
router.patch("/:id/status", paymentRecoveryController.updateRecoveryStatus);
router.delete("/:id", paymentRecoveryController.deleteRecovery);

module.exports = router;

const paymentRecoveryService = require("../services/paymentRecoveryService");

/**
 * Create new payment recovery
 */
const createRecovery = async (req, res) => {
  try {
    const createdBy = req.user?.id || 1;
    const result = await paymentRecoveryService.createPaymentRecovery(
      req.body,
      createdBy
    );

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in createRecovery:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get all recoveries with pagination and filters
 */
const getRecoveries = async (req, res) => {
  try {
    const result = await paymentRecoveryService.getPaymentRecoveries(req.query);

    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in getRecoveries:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get recovery by ID
 */
const getRecoveryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await paymentRecoveryService.getPaymentRecoveryById(id);

    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Error in getRecoveryById:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Update recovery
 */
const updateRecovery = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user?.id || 1;
    const result = await paymentRecoveryService.updatePaymentRecovery(
      id,
      req.body,
      updatedBy
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in updateRecovery:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Update recovery status
 */
const updateRecoveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedBy = req.user?.id || 1;

    const result = await paymentRecoveryService.updatePaymentRecoveryStatus(
      id,
      status,
      updatedBy
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in updateRecoveryStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Delete recovery
 */
const deleteRecovery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await paymentRecoveryService.deletePaymentRecovery(id);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in deleteRecovery:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get recovery statistics
 */
const getRecoveryStats = async (req, res) => {
  try {
    const result = await paymentRecoveryService.getPaymentRecoveryStats(
      req.query
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in getRecoveryStats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get employee list for dropdown
 */

/**
 * Get pending recoveries for employee
 */
const getPendingRecoveries = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await paymentRecoveryService.getPendingRecoveriesForEmployee(
      employeeId
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in getPendingRecoveries:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createRecovery,
  getRecoveries,
  getRecoveryById,
  updateRecovery,
  updateRecoveryStatus,
  deleteRecovery,
  getRecoveryStats,
  getEmployeeList,
  getPendingRecoveries,
};

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { createRequest } = require("./requestsModel");
const prisma = new PrismaClient();

// Serialize payment recovery data
const serializePaymentRecoveryData = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  amount: data.amount ? Number(data.amount) : null,
  payment_mode: data.payment_mode || "",
  payment_date: data.payment_date ? new Date(data.payment_date) : null,
  remarks: data.remarks || "",
});

// Create a new payment recovery
const createPaymentRecovery = async (data) => {
  try {
    const reqData = await prisma.hrms_d_payment_recovery.create({
      data: {
        ...serializePaymentRecoveryData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        status: "P", // P = Pending
      },
      include: {
        payment_recovery_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
            hrms_employee_department: {
              select: {
                department_name: true,
              },
            },
          },
        },
      },
    });

    await createRequest({
      requester_id: reqData.employee_id,
      request_type: "payment_recovery",
      reference_id: reqData.id,
      request_data: `Payment recovery amount: ${reqData.amount}`,
      createdby: data.createdby || 1,
      log_inst: data.log_inst || 1,
    });

    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating payment recovery: ${error.message}`,
      500
    );
  }
};

// Find payment recovery by ID
const findPaymentRecoveryById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_payment_recovery.findUnique({
      where: { id: parseInt(id) },
      include: {
        payment_recovery_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
            hrms_employee_department: {
              select: {
                department_name: true,
              },
            },
            hrms_employee_designation: {
              select: {
                designation_name: true,
              },
            },
          },
        },
      },
    });

    if (!reqData) {
      throw new CustomError("Payment recovery not found", 404);
    }

    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding payment recovery by ID: ${error.message}`,
      503
    );
  }
};

// Update payment recovery
const updatePaymentRecovery = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_payment_recovery.update({
      where: { id: parseInt(id) },
      include: {
        payment_recovery_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
            hrms_employee_department: {
              select: {
                department_name: true,
              },
            },
          },
        },
      },
      data: {
        ...serializePaymentRecoveryData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });

    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating payment recovery: ${error.message}`,
      500
    );
  }
};

// Delete payment recovery
const deletePaymentRecovery = async (id) => {
  try {
    await prisma.hrms_d_payment_recovery.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record cannot be deleted because it has associated data with other records. Please remove the dependent data first.",
        400
      );
    } else {
      throw new CustomError(error.meta?.constraint || error.message, 500);
    }
  }
};

// Get all payment recoveries with pagination and search
const getAllPaymentRecovery = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};

    if (search) {
      filters.OR = [
        {
          payment_recovery_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          payment_recovery_employee: {
            employee_code: { contains: search.toLowerCase() },
          },
        },
        { payment_mode: { contains: search.toLowerCase() } },
        { remarks: { contains: search.toLowerCase() } },
        { status: { contains: search.toLowerCase() } },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_payment_recovery.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        payment_recovery_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
            hrms_employee_department: {
              select: {
                department_name: true,
              },
            },
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_payment_recovery.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving payment recoveries", 503);
  }
};

// Get payment recovery statistics
const getPaymentRecoveryStats = async () => {
  try {
    const [totalRecoveries, pendingAmount, completedAmount] = await Promise.all(
      [
        prisma.hrms_d_payment_recovery.count(),
        prisma.hrms_d_payment_recovery.aggregate({
          where: { status: "P" },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.hrms_d_payment_recovery.aggregate({
          where: { status: "C" },
          _sum: { amount: true },
          _count: true,
        }),
      ]
    );

    return {
      total_recoveries: totalRecoveries,
      pending_count: pendingAmount._count,
      pending_amount: pendingAmount._sum.amount || 0,
      completed_count: completedAmount._count,
      completed_amount: completedAmount._sum.amount || 0,
    };
  } catch (error) {
    throw new CustomError("Error retrieving recovery statistics", 503);
  }
};

module.exports = {
  createPaymentRecovery,
  findPaymentRecoveryById,
  updatePaymentRecovery,
  deletePaymentRecovery,
  getAllPaymentRecovery,
  getPaymentRecoveryStats,
};
