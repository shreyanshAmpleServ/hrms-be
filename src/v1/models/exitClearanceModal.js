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
const createExitClearance = async (data) => {
  try {
    const reqData = await prisma.hrms_d_exit_clearance.create({
      data: {
        ...serializeExitClearance(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating exit clearance: ${error.message}`,
      500
    );
  }
};

// Find an exit clearance by ID
const findExitClearanceById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_exit_clearance.findUnique({
      where: { id: parseInt(id) },
      include: {
        exit_clearance_employee: true,
      },
    });
    if (!reqData) {
      throw new CustomError("Exit clearance not found", 404);
    }
    return reqData;
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
    });
    return updatedClearance;
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
const getAllExitClearances = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filterConditions = [];

    // Search OR condition on remarks
    if (search) {
      filterConditions.push({
        remarks: { contains: search },
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

    // Combine all conditions with AND
    const filters =
      filterConditions.length > 0 ? { AND: filterConditions } : {};

    const datas = await prisma.hrms_d_exit_clearance.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        exit_clearance_employee: true,
      },
    });

    const totalCount = await prisma.hrms_d_exit_clearance.count({
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
    throw new CustomError("Error retrieving exit clearances", 400);
  }
};

module.exports = {
  createExitClearance,
  findExitClearanceById,
  updateExitClearance,
  deleteExitClearance,
  getAllExitClearances,
};
