const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

const serializeEmployeeExperienceForUpdate = (data) => ({
  company_name: data.company_name || "",
  position: data.position || "",
  start_from: data.start_from ? new Date(data.start_from) : null,
  end_to: data.end_to ? new Date(data.end_to) : null,
});

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
    const prisma = getPrisma();
    const created = await prisma.hrms_employee_d_experiences.create({
      data: {
        ...serializeEmployeeExperience(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
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
    const prisma = getPrisma();
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
const updateEmployeeExperience = async (employeeId, data) => {
  try {
    const prisma = getPrisma();
    const inputExperiences = data.experiences || [];

    // Separate new and existing experiences
    const newExperiences = inputExperiences.filter((exp) => !exp.id);
    const existingExperiences = inputExperiences.filter((exp) => exp.id);

    // Get current experience IDs in DB
    const existingInDb = await prisma.hrms_employee_d_experiences.findMany({
      where: { employee_id: Number(employeeId) },
      select: { id: true },
    });

    const existingIdsInDb = existingInDb.map((exp) => exp.id);
    const incomingIds = existingExperiences.map((exp) => exp.id);

    // Determine which to delete
    const toDeleteIds = existingIdsInDb.filter(
      (id) => !incomingIds.includes(id)
    );

    await prisma.$transaction(async (tx) => {
      if (toDeleteIds.length > 0) {
        await tx.hrms_employee_d_experiences.deleteMany({
          where: { id: { in: toDeleteIds } },
        });
      }

      for (const exp of existingExperiences) {
        await tx.hrms_employee_d_experiences.update({
          where: { id: exp.id },
          data: {
            ...serializeEmployeeExperienceForUpdate(exp),
            updatedby: data.updatedby || 1,
            updatedate: new Date(),
          },
        });
      }

      for (const exp of newExperiences) {
        await tx.hrms_employee_d_experiences.create({
          data: {
            ...serializeEmployeeExperience({ ...exp, employee_id: employeeId }),
            createdby: data.updatedby || 1,
            createdate: new Date(),
            log_inst: exp.log_inst || 1,
          },
        });
      }
    });

    const employee = await prisma.hrms_d_employee.findUnique({
      where: { id: Number(employeeId) },
      include: {
        hrms_employee_designation: true,
        hrms_employee_department: true,
        hrms_employee_bank: true,
        hrms_manager: true,
        experiance_of_employee: true,
        eduction_of_employee: true,
      },
    });

    if (!employee) {
      throw new CustomError("Employee not found", 404);
    }

    return {
      ...employee,
    };
  } catch (error) {
    throw new CustomError(
      `Error updating employee experience by employee ID: ${error.message}`,
      500
    );
  }
};

// Delete an employee experience
const deleteEmployeeExperience = async (id) => {
  try {
    const prisma = getPrisma();
    await prisma.hrms_employee_d_experiences.delete({
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

const getAllEmployeeExperience = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    const prisma = getPrisma();
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filterConditions = [];

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
