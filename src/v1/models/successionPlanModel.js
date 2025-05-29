const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const serializeSuccessionPlan = (data) => ({
  critical_position: data.critical_position || "",
  current_holder_id: data.current_holder_id
    ? Number(data.current_holder_id)
    : null,
  potential_successor_id: data.potential_successor_id
    ? Number(data.potential_successor_id)
    : null,
  readiness_level: data.readiness_level || "",
  plan_date: data.plan_date ? new Date(data.plan_date) : null,
});

// Create a new succession plan
const createSuccessionPlan = async (data) => {
  try {
    const reqData = await prisma.hrms_d_succession_plan.create({
      data: {
        ...serializeSuccessionPlan(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        succession_currentHolder: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        succession_potentialSuccessor: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating succession plan: ${error.message}`,
      500
    );
  }
};

const findSuccessionPlanById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_succession_plan.findUnique({
      where: { id: parseInt(id) },
      include: {
        succession_currentHolder: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        succession_potentialSuccessor: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    if (!reqData) {
      throw new CustomError("Succession plan not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding succession plan by ID: ${error.message}`,
      503
    );
  }
};

// Update a succession plan
const updateSuccessionPlan = async (id, data) => {
  try {
    const updatedPlan = await prisma.hrms_d_succession_plan.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeSuccessionPlan(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedPlan;
  } catch (error) {
    throw new CustomError(
      `Error updating succession plan: ${error.message}`,
      500
    );
  }
};
// Delete a succession plan
const deleteSuccessionPlan = async (id) => {
  try {
    await prisma.hrms_d_succession_plan.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting succession plan: ${error.message}`,
      500
    );
  }
};

// Get all succession plans with pagination and search
const getAllSuccessionPlans = async (
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

    // Search OR condition on multiple fields
    if (search) {
      filterConditions.push({
        OR: [
          { critical_position: { contains: search } },
          { readiness_level: { contains: search } },
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

    const datas = await prisma.hrms_d_succession_plan.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        succession_currentHolder: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        succession_potentialSuccessor: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_succession_plan.count({
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
    throw new CustomError("Error retrieving succession plans", 400);
  }
};

module.exports = {
  createSuccessionPlan,
  findSuccessionPlanById,
  updateSuccessionPlan,
  deleteSuccessionPlan,
  getAllSuccessionPlans,
};
