const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

// Serialize timesheet task data
const serializeTimesheetTaskData = (data) => ({
  task_code: data.task_code || "",
  task_name: data.task_name || "",
  task_description: data.task_description || "",
  project_id: data.project_id ? Number(data.project_id) : null,
  estimated_hours: data.estimated_hours ? Number(data.estimated_hours) : null,
  task_type: data.task_type || "",
  status: data.status || "",
});

// Create a new timesheet task
const createTimesheetTask = async (data) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const reqData = await prisma.hrms_m_timesheet_task.create({
      data: {
        ...serializeTimesheetTaskData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        time_sheet_task: true,
        timesheet_task_project: true,
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating timesheet task: ${error.message}`,
      500
    );
  }
};

// Find timesheet task by ID
const findTimesheetTaskById = async (id) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const reqData = await prisma.hrms_m_timesheet_task.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Timesheet task not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding timesheet task by ID: ${error.message}`,
      503
    );
  }
};

// Update timesheet task
const updateTimesheetTask = async (id, data) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const updatedEntry = await prisma.hrms_m_timesheet_task.update({
      where: { id: parseInt(id) },
      include: {
        time_sheet_task: true,
        timesheet_task_project: true,
      },
      data: {
        ...serializeTimesheetTaskData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating timesheet task: ${error.message}`,
      500
    );
  }
};

// Delete timesheet task
const deleteTimesheetTask = async (id) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    await prisma.hrms_m_timesheet_task.delete({
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

// Get all timesheet tasks with pagination and search
const getAllTimesheetTask = async (search, page, size, startDate, endDate) => {
  const prisma = getPrisma();
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          time_sheet_task: {
            task_name: { contains: search.toLowerCase() },
          },
        },
        {
          timesheet_task_project: {
            project_name: { contains: search.toLowerCase() },
          },
        },
        { task_code: { contains: search.toLowerCase() } },
        { task_name: { contains: search.toLowerCase() } },
        { task_type: { contains: search.toLowerCase() } },
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

    const datas = await prisma.hrms_m_timesheet_task.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        time_sheet_task: true,
        timesheet_task_project: true,
      },
    });
    const totalCount = await prisma.hrms_m_timesheet_task.count({
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
    throw new CustomError("Error retrieving timesheet tasks", 503);
  }
};

module.exports = {
  createTimesheetTask,
  findTimesheetTaskById,
  updateTimesheetTask,
  deleteTimesheetTask,
  getAllTimesheetTask,
};
