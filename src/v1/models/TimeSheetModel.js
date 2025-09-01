const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeTimeSheetData = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  work_date: data.work_date ? new Date(data.work_date) : null,
  project_name: data.project_name || "",
  task_description: data.task_description || "",
  hours_worked: data.hours_worked ? Number(data.hours_worked) : null,
  approved_by: data.approved_by ? Number(data.approved_by) : null,
  approved_on: data.approved_on ? new Date(data.approved_on) : null,
  project_id: Number(data.project_id),
  remarks: data.remarks || "",
  status: data.status || "Draft",
  task_id: Number(data.task_id),
  billable_flag: data.billable_flag || "",
  work_location: data.work_location || "",
  submission_date: data.submission_date ? new Date(data.submission_date) : null,
  approval_status: data.approval_status || "",
  timesheet_type: data.timesheet_type || "",
});

// Create a new time sheet
const createTimeSheet = async (data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");

    const reqData = await prisma.hrms_d_time_sheet.create({
      data: {
        ...serializeTimeSheetData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
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
      throw new CustomError("Time sheet not found", 404);
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
    const updatedEntry = await prisma.hrms_d_time_sheet.update({
      where: { id: parseInt(id) },

      data: {
        ...serializeTimeSheetData(data),
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

    return updatedEntry;
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
    if (error.code === "P2003") {
      throw new CustomError(
        "This record cannot be deleted because it has associated data other records. Please remove the dependent data first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
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
