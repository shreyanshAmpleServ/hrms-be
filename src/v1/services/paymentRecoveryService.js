const paymentRecoveryModel = require("../models/paymentRecoveryModel.js");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPaymentRecovery = async (data) => {
  return await paymentRecoveryModel.createPaymentRecovery(data);
};

const findPaymentRecoveryById = async (id) => {
  return await paymentRecoveryModel.findPaymentRecoveryById(id);
};

const updatePaymentRecovery = async (id, data) => {
  return await paymentRecoveryModel.updatePaymentRecovery(id, data);
};

const deletePaymentRecovery = async (id) => {
  return await paymentRecoveryModel.deletePaymentRecovery(id);
};

const getAllPaymentRecovery = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await paymentRecoveryModel.getAllPaymentRecovery(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

const getPaymentRecoveryStats = async () => {
  return await paymentRecoveryModel.getPaymentRecoveryStats();
};

const updatePaymentRecoveryStatus = async (recoveryId, status, updatedBy) => {
  try {
    const validStatuses = ["P", "A", "R"];

    if (!validStatuses.includes(status)) {
      return {
        success: false,
        message: "Invalid status. Use P (Pending), A (Approved), R (Rejected)",
      };
    }

    const recovery = await prisma.hrms_d_payment_recovery.update({
      where: { id: parseInt(recoveryId) },
      data: {
        status,
        updatedby: updatedBy,
        updatedate: new Date(),
      },
      include: {
        payment_recovery_employee: {
          select: {
            full_name: true,
            employee_code: true,
          },
        },
      },
    });

    const statusText = {
      P: "Pending",
      C: "Completed",
      R: "Rejected",
    };

    return {
      success: true,
      data: recovery,
      message: `Payment recovery status updated to ${statusText[status]}`,
    };
  } catch (error) {
    console.error("Error updating recovery status:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to update recovery status",
    };
  }
};

module.exports = {
  createPaymentRecovery,
  findPaymentRecoveryById,
  updatePaymentRecovery,
  deletePaymentRecovery,
  getAllPaymentRecovery,
  getPaymentRecoveryStats,
  updatePaymentRecoveryStatus,
};
