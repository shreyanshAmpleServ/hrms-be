const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize goal sheet assignment data
const serializeGoalSheetAssignmentData = (data) => ({
  employee_id: Number(data.employee_id),
  appraisal_cycle_id: Number(data.appraisal_cycle_id),
  goal_category_id: data.goal_category_id
    ? Number(data.goal_category_id)
    : null,
  goal_description: data.goal_description || "",
  weightage: data.weightage ? Number(data.weightage) : 0,
  target_value: data.target_value || "",
  measurement_criteria: data.measurement_criteria || "",
  due_date: data.due_date ? new Date(data.due_date) : null,
  status: data.status || "Draft",
});

// Create a new goal sheet assignment
const createGoalSheet = async (data) => {
  try {
    const reqData = await prisma.hrms_d_goal_sheet_assignment.create({
      data: {
        ...serializeGoalSheetAssignmentData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        goal_sheet_assignment_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        goal_sheet_assignment_goalCategory: true,
        goal_sheet_assignment_appraisal: true,
        kpi_progress_entry_goal: true,
      },
    });

    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating goal sheet assignment: ${error.message}`,
      500
    );
  }
};

// Find goal sheet assignment by ID
const findGoalSheetById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_goal_sheet_assignment.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Goal sheet assignment not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding goal sheet assignment by ID: ${error.message}`,
      503
    );
  }
};

// Update goal sheet assignment
const updateGoalSheet = async (id, data) => {
  try {
    const existing = await prisma.hrms_d_goal_sheet_assignment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      throw new CustomError(
        `Goal sheet assignment with id ${id} not found`,
        404
      );
    }

    const updatedEntry = await prisma.hrms_d_goal_sheet_assignment.update({
      where: { id: parseInt(id) },
      include: {
        goal_sheet_assignment_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        goal_sheet_assignment_goalCategory: true,
        goal_sheet_assignment_appraisal: true,
        kpi_progress_entry_goal: true,
      },
      data: {
        ...serializeGoalSheetAssignmentData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating goal sheet assignment: ${error.message}`,
      error.statusCode || 500
    );
  }
};

// Delete goal sheet assignment
const deleteGoalSheet = async (id) => {
  try {
    const progressEntryCount = await prisma.hrms_d_kpi_progress_entry.count({
      where: { goal_id: Number(id) },
    });

    if (progressEntryCount > 0) {
      throw new CustomError(
        "Cannot delete: This goal is referenced by KPI progress entries.",
        409 // HTTP 409 Conflict
      );
    }

    await prisma.hrms_d_goal_sheet_assignment.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      error.message?.includes("referenced by KPI progress")
        ? error.message
        : `Error deleting goal sheet assignment: ${error.message}`,
      error.statusCode || 500
    );
  }
};

// Get all goal sheet assignments with pagination and search
const getAllGoalSheet = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          goal_sheet_assignment_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        { goal_description: { contains: search.toLowerCase() } },
        { status: { contains: search.toLowerCase() } },
        {
          measurement_criteria: {
            contains: search.toLowerCase(),
          },
        },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_goal_sheet_assignment.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        goal_sheet_assignment_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        goal_sheet_assignment_goalCategory: true,
        goal_sheet_assignment_appraisal: true,

        kpi_progress_entry_goal: true,
      },
    });
    const totalCount = await prisma.hrms_d_goal_sheet_assignment.count({
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
    throw new CustomError("Error retrieving goal sheet assignments", 503);
  }
};

module.exports = {
  createGoalSheet,
  findGoalSheetById,
  updateGoalSheet,
  deleteGoalSheet,
  getAllGoalSheet,
};
