const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize employee experience data
const serializeEmployeeExperience = (data) => ({
  employee_id: Number(data.employee_id),
  company_name: data.company_name || "",
  position: data.position || "",
  start_from: data.start_from ? new Date(data.start_from) : null,
  end_to: data.end_to ? new Date(data.end_to) : null,
});

// Create a new employee experience
const createEmployeeExperience = async (data) => {
  try {
    const created = await prisma.hrms_employee_d_experiences.create({
      data: {
        ...serializeEmployeeExperience(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    // Fetch with relation for employee name
    return await prisma.hrms_employee_d_experiences.findUnique({
      where: { id: created.id },
      include: {
        experiance_of_employee: true,
      },
    });
  } catch (error) {
    throw new CustomError(
      `Error creating employee experience: ${error.message}`,
      500
    );
  }
};

// Find an employee experience by ID
const findEmployeeExperienceById = async (id) => {
  try {
    const reqData = await prisma.hrms_employee_d_experiences.findUnique({
      where: { id: parseInt(id) },
      include: {
        experiance_of_employee: true,
      },
    });
    if (!reqData) {
      throw new CustomError("Employee experience not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding employee experience by ID: ${error.message}`,
      503
    );
  }
};

// Update an employee experience
const updateEmployeeExperience = async (id, data) => {
  try {
    const updated = await prisma.hrms_employee_d_experiences.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeEmployeeExperience(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    // Fetch with relation for employee name
    return await prisma.hrms_employee_d_experiences.findUnique({
      where: { id: updated.id },
      include: {
        experiance_of_employee: true,
      },
    });
  } catch (error) {
    throw new CustomError(
      `Error updating employee experience: ${error.message}`,
      500
    );
  }
};

// Delete an employee experience
const deleteEmployeeExperience = async (id) => {
  try {
    await prisma.hrms_employee_d_experiences.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting employee experience: ${error.message}`,
      500
    );
  }
};

// Get all employee experiences with pagination and search
const getAllEmployeeExperience = async (
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

    const filterConditions = [];

    // Search OR condition on company_name and position
    if (search) {
      filterConditions.push({
        OR: [
          {
            experiance_of_employee: {
              OR: [
                { first_name: { contains: search.toLowerCase() } },
                { last_name: { contains: search.toLowerCase() } },
              ],
            },
          },
          {
            company_name: {
              contains: search.toLowerCase(),
            },
          },
          {
            position: {
              contains: search.toLowerCase(),
            },
          },
        ],
      });
    }

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

    const datas = await prisma.hrms_employee_d_experiences.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        experiance_of_employee: true,
      },
    });

    const totalCount = await prisma.hrms_employee_d_experiences.count({
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
    console.error("Prisma error in getAllEmployeeExperience:", error);
    throw new CustomError(
      `Error retrieving employee experiences: ${error.message}`,
      400
    );
  }
};

module.exports = {
  createEmployeeExperience,
  findEmployeeExperienceById,
  updateEmployeeExperience,
  deleteEmployeeExperience,
  getAllEmployeeExperience,
};
