const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const serializePaymentRecoveryData = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  amount: data.amount ? Number(data.amount) : null,
  payment_mode: data.payment_mode || "",
  payment_date: data.payment_date ? new Date(data.payment_date) : null,
  remarks: data.remarks || "",
});

const serializePaymentRecoveryUpdateData = (data) => {
  const updateData = {};

  if (data.employee_id !== undefined) {
    updateData.employee_id = Number(data.employee_id);
  }
  if (data.amount !== undefined) {
    updateData.amount = Number(data.amount);
  }
  if (data.payment_mode !== undefined) {
    updateData.payment_mode = data.payment_mode || "";
  }
  if (data.payment_date !== undefined) {
    updateData.payment_date = data.payment_date
      ? new Date(data.payment_date)
      : null;
  }
  if (data.remarks !== undefined) {
    updateData.remarks = data.remarks || "";
  }
  if (data.status !== undefined) {
    updateData.status = data.status || "P";
  }

  return updateData;
};

const createPaymentRecovery = async (data) => {
  try {
    const reqData = await prisma.hrms_d_payment_recovery.create({
      data: {
        ...serializePaymentRecoveryData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        status: "P",
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
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating payment recovery: ${error.message}`,
      500
    );
  }
};

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
    if (error instanceof CustomError) throw error;
    throw new CustomError(
      `Error finding payment recovery by ID: ${error.message}`,
      503
    );
  }
};

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
        ...serializePaymentRecoveryUpdateData(data),
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

const getAllPaymentRecovery = async (
  search,
  page,
  size,
  startDate,
  endDate,
  employee_id
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};

    if (employee_id) {
      filters.employee_id = Number(employee_id);
    }

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

    const [datas, totalCount] = await Promise.all([
      prisma.hrms_d_payment_recovery.findMany({
        where: filters,
        skip,
        take: parseInt(size),
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
      }),
      prisma.hrms_d_payment_recovery.count({
        where: filters,
      }),
    ]);

    return {
      data: datas,
      currentPage: parseInt(page),
      size: parseInt(size),
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving payment recoveries", 503);
  }
};

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

const updatePaymentRecoveryStatus = async (id, data) => {
  return prisma.hrms_d_payment_recovery.update({
    where: { id: parseInt(id) },
    data,
  });
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
