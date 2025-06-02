const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize employee education data
const serializeEmployeeEducation = (data) => ({
  employee_id: Number(data.employee_id),
  institute_name: data.institute_name || "",
  degree: data.degree || "",
  specialization: data.specialization || "",
});

// Create a new employee education
const createEmployeeEducation = async (data) => {
  try {
    const created = await prisma.hrms_employee_d_educations.create({
      data: {
        ...serializeEmployeeEducation(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    // Fetch with relation for employee name
    return await prisma.hrms_employee_d_educations.findUnique({
      where: { id: created.id },
      include: {
        eduction_of_employee: true,
      },
    });
  } catch (error) {
    throw new CustomError(
      `Error creating employee education: ${error.message}`,
      500
    );
  }
};

// Find an employee education by ID
const findEmployeeEducationById = async (id) => {
  try {
    const reqData = await prisma.hrms_employee_d_educations.findUnique({
      where: { id: parseInt(id) },
      include: {
        eduction_of_employee: true,
      },
    });
    if (!reqData) {
      throw new CustomError("Employee education not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding employee education by ID: ${error.message}`,
      503
    );
  }
};

// Update an employee education
const updateEmployeeEducation = async (id, data) => {
  try {
    const updated = await prisma.hrms_employee_d_educations.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeEmployeeEducation(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return await prisma.hrms_employee_d_educations.findUnique({
      where: { id: updated.id },
      include: {
        eduction_of_employee: true,
      },
    });
  } catch (error) {
    throw new CustomError(
      `Error updating employee education: ${error.message}`,
      500
    );
  }
};

// Delete an employee education
const deleteEmployeeEducation = async (id) => {
  try {
    await prisma.hrms_employee_d_educations.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting employee education: ${error.message}`,
      500
    );
  }
};

// Get all employee educations with pagination and search
const getAllEmployeeEducation = async (
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

    if (search) {
      filterConditions.push({
        OR: [
          {
            eduction_of_employee: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          { institute_name: { contains: search.toLowerCase() } },
          { degree: { contains: search.toLowerCase() } },
          { specialization: { contains: search.toLowerCase() } },
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

    // Combine all conditions with AND
    const filters =
      filterConditions.length > 0 ? { AND: filterConditions } : {};

    const datas = await prisma.hrms_employee_d_educations.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        eduction_of_employee: true,
      },
    });

    const totalCount = await prisma.hrms_employee_d_educations.count({
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
    throw new CustomError("Error retrieving employee educations", 400);
  }
};

module.exports = {
  createEmployeeEducation,
  findEmployeeEducationById,
  updateEmployeeEducation,
  deleteEmployeeEducation,
  getAllEmployeeEducation,
};
