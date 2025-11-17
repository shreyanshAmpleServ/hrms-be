const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

// Serialize KPI progress entry data
const serializeKpiProgressEntryData = (data) => {
  const reviewedBy = data.reviewed_by ? Number(data.reviewed_by) : null;

  return {
    employee_id: Number(data.employee_id),
    goal_id: Number(data.goal_id),
    entry_date: data.entry_date ? new Date(data.entry_date) : new Date(),
    progress_value: data.progress_value || "",
    remarks: data.remarks || "",
    reviewed_by: reviewedBy,
    reviewed_on: data.reviewed_on ? new Date(data.reviewed_on) : null,
  };
};

// Create a new KPI progress entry
const createKpiProgress = async (data) => {
  try {
    const reqData = await prisma.hrms_d_kpi_progress_entry.create({
      data: {
        ...serializeKpiProgressEntryData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        kpi_progress_entry_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        kpi_progress_entry_goal: true,
        kpi_progress_entry_reviewedBy: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating KPI progress entry: ${error.message}`,
      500
    );
  }
};

// Find KPI progress entry by ID
const findKpiProgressById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_kpi_progress_entry.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("KPI progress entry not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding KPI progress entry by ID: ${error.message}`,
      503
    );
  }
};

// Update KPI progress entry
const updateKpiProgress = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_kpi_progress_entry.update({
      where: { id: parseInt(id) },
      include: {
        kpi_progress_entry_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        kpi_progress_entry_goal: true,
        kpi_progress_entry_reviewedBy: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },

      data: {
        ...serializeKpiProgressEntryData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating KPI progress entry: ${error.message}`,
      500
    );
  }
};

// Delete KPI progress entry
const deleteKpiProgress = async (id) => {
  try {
    await prisma.hrms_d_kpi_progress_entry.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

// Get all KPI progress entries with pagination and search
const getAllKpiProgress = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          kpi_progress_entry_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },

        {
          kpi_progress_entry_reviewedBy: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        { progress_value: { contains: search.toLowerCase() } },
        { remarks: { contains: search.toLowerCase() } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.entry_date = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_kpi_progress_entry.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        kpi_progress_entry_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        kpi_progress_entry_goal: true,
        kpi_progress_entry_reviewedBy: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    const totalCount = await prisma.hrms_d_kpi_progress_entry.count({
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
    throw new CustomError("Error retrieving KPI progress entries", 503);
  }
};

module.exports = {
  createKpiProgress,
  findKpiProgressById,
  updateKpiProgress,
  deleteKpiProgress,
  getAllKpiProgress,
};
