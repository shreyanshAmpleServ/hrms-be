const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize exit clearance data
const serializeExitClearance = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  clearance_date: data.clearance_date ? new Date(data.clearance_date) : null,
  cleared_by: data.cleared_by ? Number(data.cleared_by) : null,
  remarks: data.remarks || "",
});

// Create a new exit clearance
// const createExitClearance = async (data) => {
//   try {
//     const reqData = await prisma.hrms_d_exit_clearance.create({
//       data: {
//         ...serializeExitClearance(data),
//         createdby: Number(data.createdby) || 1,
//         createdate: new Date(),
//         log_inst: data.log_inst || 1,
//       },
//       include: {
//         exit_clearance_by_user: {
//           // <-- include the user who cleared
//           select: { id: true, full_name: true },
//         },
//         exit_clearance_employee: {
//           // still include the employee
//           select: { id: true, full_name: true },
//         },
//       },
//     });

//     return reqData;
//   } catch (error) {
//     throw new CustomError(
//       `Error creating exit clearance: ${error.message}`,
//       500
//     );
//   }
// };

const createExitClearance = async (data) => {
  try {
    const parent = await prisma.hrms_d_exit_clearance.create({
      data: {
        employee_id: Number(data.employee_id) || null,
        clearance_date: data.clearance_date
          ? new Date(data.clearance_date)
          : null,
        cleared_by: Number(data.cleared_by) || null,
        remarks: data.remarks || "",
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        updatedby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
    });

    const childDetails = (data.details || []).map((item) => ({
      parent_id: parent.id,
      pay_component_id: Number(item.pay_component_id) || null,
      payment_or_deduction: Number(item.payment_or_deduction) || null,
      amount: parseFloat(item.amount) || null,
      remarks: item.remarks || "",
      pay_component_name: item.pay_component_name || "",
    }));
  } catch (error) {
    console.log("Error in creating exit cleareaance", error);
    next(error);
  }
};

// Find an exit clearance by ID
const findExitClearanceById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_exit_clearance.findUnique({
      where: { id: parseInt(id) },
      include: {
        exit_clearance_employee: { select: { id: true, full_name: true } },
        exit_clearance_by_user: { select: { id: true, full_name: true } },
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
const updateExitClearance = async (id, data) => {
  try {
    const updatedClearance = await prisma.hrms_d_exit_clearance.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeExitClearance(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        exit_clearance_by_user: {
          select: {
            id: true,
            full_name: true,
          },
        },
        exit_clearance_employee: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedClearance,
      message: "Exit clearance updated successfully",
      status: 200,
    };
  } catch (error) {
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

    // Search OR condition on remarks
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

    // Date range condition
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
