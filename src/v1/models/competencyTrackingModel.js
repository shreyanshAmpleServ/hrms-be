const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");

const serializeData = (data) => {
  return {
    employee_id: Number(data.employee_id) || null,
    skill_name: data.skill_name || "",
    proficiency_level: data.proficiency_level || "",
    last_assessed_date: data.last_assessed_date || null,
  };
};

// Create a new competency tracking
const createCompetencyTracking = async (data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    const reqData = await prisma.hrms_d_competency.create({
      data: {
        ...serializeData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        competency_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating competency tracking: ${error.message}`,
      500
    );
  }
};

// Find a competency tracking by ID
const findCompetencyTrackingById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_competency.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("competency tracking not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding competency tracking by ID: ${error.message}`,
      503
    );
  }
};

// Update a competency tracking
const updateCompetencyTracking = async (id, data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");

    const updatedCompetencyTracking = await prisma.hrms_d_competency.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        competency_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    return updatedCompetencyTracking;
  } catch (error) {
    throw new CustomError(
      `Error updating competency tracking: ${error.message}`,
      500
    );
  }
};

// Delete a competency tracking
const deleteCompetencyTracking = async (id) => {
  try {
    await prisma.hrms_d_competency.delete({
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

// Get all competency tracking
const getAllCompetencyTracking = async (
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
    // Handle search
    if (search) {
      filters.OR = [
        {
          competency_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          skill_name: { contains: search.toLowerCase() },
        },
        {
          proficiency_level: { contains: search.toLowerCase() },
        },
      ];
    }

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
    const datas = await prisma.hrms_d_competency.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        competency_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const totalCount = await prisma.hrms_d_competency.count();
    const totalCount = await prisma.hrms_d_competency.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error", error);
    throw new CustomError("Error retrieving competency tracking", 503);
  }
};

module.exports = {
  createCompetencyTracking,
  findCompetencyTrackingById,
  updateCompetencyTracking,
  deleteCompetencyTracking,
  getAllCompetencyTracking,
};
