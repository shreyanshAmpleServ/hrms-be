const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { number } = require("zod/v4");
const prisma = new PrismaClient();

// Serialize exit clearance data
const serializeExitClearance = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  clearance_date: data.clearance_date ? new Date(data.clearance_date) : null,
  cleared_by: data.cleared_by ? Number(data.cleared_by) : null,
  remarks: data.remarks || "",
});

const createExitClearance = async (data) => {
  try {
    if (!Array.isArray(data.children) || data.children.length === 0) {
      throw new CustomError("Children field is required", 400);
    }
    const parent = await prisma.hrms_d_exit_clearance.create({
      data: {
        employee_id: Number(data.employee_id) || null,
        clearance_date: data.clearance_date
          ? new Date(data.clearance_date)
          : null,
        cleared_by: Number(data.cleared_by) || null,
        remarks: data.remarks || "",
        createdby: data.createdby || 1,
        createdate: new Date(),
        updatedby: data.createdby || 1,
        updatedate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });

    const children = (data.children || []).map((item) => ({
      parent_id: parent.id,
      pay_component_id: Number(item.pay_component_id) || null,
      payment_or_dedcution: item.payment_or_dedcution || "",
      no_of_days: Number(item.no_of_days) || 0,
      amount: parseFloat(item.amount) || 0,
      remarks: item.remarks || "",
      createdate: new Date(),
      createdby: data.createdby || 1,
      updatedate: new Date(),
      updatedby: data.createdby || 1,
      log_inst: data.log_inst || 1,
    }));

    await prisma.hrms_d_exit_clearance1.createMany({ data: children });

    const fullData = await prisma.hrms_d_exit_clearance.findUnique({
      where: { id: parent.id },
      include: {
        exit_clearance_employee: { select: { id: true, full_name: true } },
        // exit_clearance_by_user: { select: { id: true, full_name: true } }, // Optional
        hrms_d_exit_clearance1: {
          include: {
            exit_clearance_pay: true,
          },
        },
      },
    });

    return fullData;
  } catch (error) {
    throw new CustomError(
      `Error creating exit clearance: ${error.message}`,
      500
    );
  }
};

const findExitClearanceById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_exit_clearance.findUnique({
      where: { id: parseInt(id) },
      include: {
        exit_clearance_employee: { select: { id: true, full_name: true } },
        hrms_d_exit_clearance1: {
          include: {
            exit_clearance_pay: true,
          },
        },
      },
    });

    if (!reqData) {
      throw new CustomError("Exit clearance not found", 404);
    }
    return {
      ...reqData,
      cleared_by_id: reqData.exit_clearance_by_user?.id || null,
      cleared_by_name: reqData.exit_clearance_by_user?.full_name || null,
    };
  } catch (error) {
    throw new CustomError(
      `Error finding exit clearance by ID: ${error.message}`,
      503
    );
  }
};

// Update an exit clearance
// const updateExitClearance = async (id, data) => {
//   try {
//     const updatedClearance = await prisma.hrms_d_exit_clearance.update({
//       where: { id: parseInt(id) },
//       data: {
//         ...serializeExitClearance(data),
//         updatedby: data.updatedby || 1,
//         updatedate: new Date(),
//       },
//       include: {
//         exit_clearance_by_user: {
//           select: {
//             id: true,
//             full_name: true,
//           },
//         },
//         exit_clearance_employee: {
//           select: {
//             id: true,
//             full_name: true,
//           },
//         },
//       },
//     });

//     return {
//       success: true,
//       data: updatedClearance,
//       message: "Exit clearance updated successfully",
//       status: 200,
//     };
//   } catch (error) {
//     throw new CustomError(
//       `Error updating exit clearance: ${error.message}`,
//       500
//     );
//   }
// };

const updateExitClearance = async (id, data) => {
  try {
    const parentId = parseInt(id);
    await prisma.hrms_d_exit_clearance.update({
      where: { id: parentId },
      data: {
        employee_id: Number(data.employee_id) || null,
        clearance_date: data.clearance_date
          ? new Date(data.clearance_date)
          : null,
        cleared_by: Number(data.cleared_by) || null,
        remarks: data.remarks || "",
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });

    for (const item of data.children || []) {
      if (item.id) {
        const updated = await prisma.hrms_d_exit_clearance1.update({
          where: { id: item.id },
          data: {
            pay_component_id: Number(item.pay_component_id) || null,
            payment_or_dedcution: item.payment_or_dedcution || "",
            no_of_days: Number(item.no_of_days) || 0,
            amount: parseFloat(item.amount) || 0,
            remarks: item.remarks || "",
            updatedby: data.updatedby || 1,
            updatedate: new Date(),
          },
        });
        console.log("Updated record:", updated);
      } else {
        await prisma.hrms_d_exit_clearance1.create({
          data: {
            parent_id: parentId,
            pay_component_id: Number(item.pay_component_id) || null,
            payment_or_dedcution: item.payment_or_dedcution || "",
            no_of_days: Number(item.no_of_days) || 0,
            amount: parseFloat(item.amount) || 0,
            remarks: item.remarks || "",
            createdate: new Date(),
            createdby: data.updatedby || 1,
            updatedate: new Date(),
            updatedby: data.updatedby || 1,
            log_inst: data.log_inst || 1,
          },
        });
      }
    }

    const updatedData = await prisma.hrms_d_exit_clearance.findUnique({
      where: { id: parentId },
      include: {
        exit_clearance_employee: { select: { id: true, full_name: true } },
        hrms_d_exit_clearance1: {
          include: {
            exit_clearance_pay: true,
          },
        },
      },
    });

    return updatedData;
  } catch (error) {
    console.log("Error updating exit clearance ", error);
    throw new CustomError(
      `Error updating exit clearance: ${error.message}`,
      500
    );
  }
};

// Delete an exit clearance
const deleteExitClearance = async (id) => {
  try {
    await prisma.hrms_d_exit_clearance.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting exit clearance: ${error.message}`,
      500
    );
  }
};

// Get all exit clearances with pagination and search
const getAllExitClearance = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filterConditions = [];

    // Search
    if (search) {
      filterConditions.push({
        OR: [
          {
            exit_clearance_employee: {
              full_name: {
                contains: search.toLowerCase(),
              },
            },
          },
          { remarks: { contains: search.toLowerCase() } },
        ],
      });
    }

    // Date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filterConditions.push({
          createdate: {
            gte: start,
            lte: end,
          },
        });
      }
    }

    const filters =
      filterConditions.length > 0 ? { AND: filterConditions } : {};

    const datas = await prisma.hrms_d_exit_clearance.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        exit_clearance_employee: { select: { id: true, full_name: true } },
        exit_clearance_by_user: { select: { id: true, full_name: true } },
        hrms_d_exit_clearance1: {
          include: {
            exit_clearance_pay: true,
          },
        },
      },
    });

    const processed = datas.map((item) => ({
      id: item.id,
      employee_id: item.employee_id,
      clearance_date: item.clearance_date,
      cleared_by: item.cleared_by,
      remarks: item.remarks,
      createdate: item.createdate,
      createdby: item.createdby,
      updatedate: item.updatedate,
      updatedby: item.updatedby,
      log_inst: item.log_inst,
      exit_clearance_by_user: item.exit_clearance_by_user,
      exit_clearance_employee: item.exit_clearance_employee,
      hrms_d_exit_clearance1: item.hrms_d_exit_clearance1,
    }));

    const totalCount = await prisma.hrms_d_exit_clearance.count({
      where: filters,
    });

    return {
      data: processed,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.error("Error in getAllExitClearance:", error);
    throw new CustomError("Error retrieving exit clearances", 400);
  }
};

module.exports = {
  createExitClearance,
  findExitClearanceById,
  updateExitClearance,
  deleteExitClearance,
  getAllExitClearance,
};
