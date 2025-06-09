const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeJobData = (data) => {
  return {
    work_date: data.work_date ? new Date(data.work_date) : new Date(),
    project_name: data.project_name || "",
    task_description: data.task_description || "",
    hours_worked: data.hours_worked || 0,
    // Add approved_on if present, else undefined so it doesn’t override
    ...(data.approved_on ? { approved_on: new Date(data.approved_on) } : {}),
    ...(data.approved_by ? { approved_by: data.approved_by } : {}),
  };
};

// Create a new time sheet
const createTimeSheet = async (data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");

    const reqData = await prisma.hrms_d_time_sheet.create({
      data: {
        ...serializeJobData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,

        approved_on: data.approved_on ? new Date(data.approved_on) : new Date(),
        approved_by: data.approved_by || data.createdby || 1, // <--- add this line

        project_id: data.project_id,
        task_id: data.task_id,
        employee_id: data.employee_id,
      },
      include: {
        hrms_time_sheets_submitted: {
          select: { full_name: true, id: true },
        },
        hrms_time_sheets_approved: {
          select: { full_name: true, id: true },
        },
        time_sheet_project: true,
        time_sheet_task: true,
      },
    });

    return reqData;
  } catch (error) {
    throw new CustomError(`Error creating time sheet: ${error.message}`, 500);
  }
};

// Find a time sheet by ID
const findTimeSheetById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_time_sheet.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("time sheet not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding time sheet by ID: ${error.message}`,
      503
    );
  }
};

// Update a time sheet
const updateTimeSheet = async (id, data) => {
  try {
    const existing = await prisma.hrms_d_time_sheet.findUnique({
      where: { id: parseInt(id) },
    });

    const employeeIdToCheck = data.employee_id || existing?.employee_id;

    if (!employeeIdToCheck) {
      throw new Error("Missing employee ID");
    }

    await errorNotExist("hrms_d_employee", employeeIdToCheck, "Employee");

    const updatedTimeSheet = await prisma.hrms_d_time_sheet.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeJobData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        hrms_time_sheets_submitted: {
          select: { full_name: true, id: true },
        },
        hrms_time_sheets_approved: {
          select: { full_name: true, id: true },
        },
        time_sheet_project: true,
        time_sheet_task: true,
      },
    });

    return updatedTimeSheet;
  } catch (error) {
    throw new CustomError(`Error updating time sheet: ${error.message}`, 500);
  }
};

// Delete a time sheet
const deleteTimeSheet = async (id) => {
  try {
    await prisma.hrms_d_time_sheet.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting time sheet: ${error.message}`, 500);
  }
};

// Get all time sheets
const getAllTimeSheet = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : parseInt(page);
    size = size ? parseInt(size) : 10;
    const skip = (page - 1) * size;

    const filters = {};

    if (search) {
      filters.OR = [
        {
          hrms_time_sheets_submitted: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          status: { contains: search.toLowerCase() },
        },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date range");
      }

      filters.createdate = {
        gte: start,
        lte: end,
      };
    }

    const datas = await prisma.hrms_d_time_sheet.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        hrms_time_sheets_submitted: {
          select: { full_name: true, id: true },
        },
        hrms_time_sheets_approved: {
          select: { full_name: true, id: true },
        },
        time_sheet_project: true,
        time_sheet_task: true,
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_d_time_sheet.count({
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
    console.error("Error in getAllTimeSheet:", error);
    throw new CustomError(error.message || "Error retrieving time sheets", 400);
  }
};

module.exports = {
  createTimeSheet,
  findTimeSheetById,
  updateTimeSheet,
  deleteTimeSheet,
  getAllTimeSheet,
};
