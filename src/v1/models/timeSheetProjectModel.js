const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

// Serialize timesheet project data
const serializeTimesheetProjectData = (data) => ({
  project_code: data.project_code || "",
  project_name: data.project_name || "",
  client_name: data.client_name || "",
  project_manager_id: data.project_manager_id
    ? Number(data.project_manager_id)
    : null,
  start_date: data.start_date ? new Date(data.start_date) : null,
  end_date: data.end_date ? new Date(data.end_date) : null,
  status: data.status || "",
});

// Create a new timesheet project
const createTimeSheetProject = async (data) => {
  try {
    const reqData = await prisma.hrms_m_timesheet_project.create({
      data: {
        ...serializeTimesheetProjectData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        timesheet_task_project: true,
        time_sheet_project: true,
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating timesheet project: ${error.message}`,
      500
    );
  }
};

// Find timesheet project by ID
const findTimeSheetProjectById = async (id) => {
  try {
    const reqData = await prisma.hrms_m_timesheet_project.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Timesheet project not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding timesheet project by ID: ${error.message}`,
      503
    );
  }
};

// Update timesheet project
const updateTimeSheetProject = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_m_timesheet_project.update({
      where: { id: parseInt(id) },
      include: {
        timesheet_task_project: true,
        time_sheet_project: true,
      },
      data: {
        ...serializeTimesheetProjectData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating timesheet project: ${error.message}`,
      500
    );
  }
};

// Delete timesheet project
const deleteTimeSheetProject = async (id) => {
  try {
    await prisma.hrms_m_timesheet_project.delete({
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

// Get all timesheet projects with pagination and search
const getAllTimeSheetProjects = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};

    // Search filter (case-sensitive)
    if (search) {
      filters.OR = [
        {
          timesheet_task_project: {
            some: {
              task_name: {
                contains: search.toLowerCase(), // case-sensitive
              },
            },
          },
        },
        {
          time_sheet_project: {
            some: {
              project_name: {
                contains: search.toLowerCase(), // case-sensitive
              },
            },
          },
        },
        { project_code: { contains: search.toLowerCase() } },
        { project_name: { contains: search.toLowerCase() } },
        { client_name: { contains: search.toLowerCase() } },
        { status: { contains: search.toLowerCase() } },
      ];
    }

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = {
          gte: start,
          lte: end,
        };
      }
    }

    // Fetch results
    const datas = await prisma.hrms_m_timesheet_project.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        timesheet_task_project: true,
        time_sheet_project: true,
      },
    });

    const totalCount = await prisma.hrms_m_timesheet_project.count({
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
    console.error("Error retrieving timesheet projects:", error); // Log actual error
    throw new CustomError("Error retrieving timesheet projects", 503);
  }
};

module.exports = {
  createTimeSheetProject,
  findTimeSheetProjectById,
  updateTimeSheetProject,
  deleteTimeSheetProject,
  getAllTimeSheetProjects,
};
