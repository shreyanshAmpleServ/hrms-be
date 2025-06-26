const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize project data
const serializeProjectData = (data) => ({
  code: data.code,
  name: data.name || null,
  locked: data.locked || "N",
  valid_from: data.valid_from ? new Date(data.valid_from) : null,
  valid_to: data.valid_to ? new Date(data.valid_to) : null,
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  is_active: data.is_active || "Y",
  createdby: data.createdby || 1,
  createdate: new Date(),
  log_inst: data.log_inst || 1,
});

// Create
const createProject = async (data) => {
  try {
    const result = await prisma.hrms_m_projects.create({
      data: serializeProjectData(data),
      include: {
        projects_employee_detail: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
          },
        },
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(`Error creating project: ${error.message}`, 500);
  }
};

// Get all
const getAllProjects = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;
    const filters = {};

    if (search) {
      filters.OR = [
        { code: { contains: search.toLowerCase() } },
        { name: { contains: search.toLowerCase() } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const data = await prisma.hrms_m_projects.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: { createdate: "desc" },
      include: {
        projects_employee_detail: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_m_projects.count({ where: filters });
    //co
    return {
      data: data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.log("Error ", error);

    throw new CustomError("Error retrieving projects", 503);
  }
};

// Get by ID
const findProjectById = async (id) => {
  try {
    const result = await prisma.hrms_m_projects.findUnique({
      where: { id: parseInt(id) },
      include: {
        projects_employee_detail: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
          },
        },
      },
    });

    if (!result) throw new CustomError("Project not found", 404);
    return result;
  } catch (error) {
    throw new CustomError(`Error retrieving project: ${error.message}`, 500);
  }
};

// Update
const updateProject = async (id, data) => {
  try {
    const result = await prisma.hrms_m_projects.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeProjectData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        projects_employee_detail: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
          },
        },
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(`Error updating project: ${error.message}`, 500);
  }
};

// Delete
const deleteProject = async (id) => {
  try {
    await prisma.hrms_m_projects.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting project: ${error.message}`, 500);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  findProjectById,
  updateProject,
  deleteProject,
};
