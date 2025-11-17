const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

// Serialize succession plan data
const serializeSuccessionPlanData = (data) => ({
  critical_position: data.critical_position || "",
  current_holder_id: data.current_holder_id
    ? Number(data.current_holder_id)
    : null,
  potential_successor_id: data.potential_successor_id
    ? Number(data.potential_successor_id)
    : null,
  readiness_level: data.readiness_level || "",
  plan_date: data.plan_date ? new Date(data.plan_date) : null,
  role_id: data.role_id ? Number(data.role_id) : null,
  notes: data.notes || "",
  evaluation_date: data.evaluation_date ? new Date(data.evaluation_date) : null,
  evaluated_by: data.evaluated_by ? Number(data.evaluated_by) : null,
  status: data.status || "Draft",
  development_plan: data.development_plan || "",
  successor_rank: data.successor_rank ? Number(data.successor_rank) : null,
  expected_transition_date: data.expected_transition_date
    ? new Date(data.expected_transition_date)
    : null,
  risk_of_loss: data.risk_of_loss || "",
  retention_plan: data.retention_plan || "",
  last_updated_by_hr: data.last_updated_by_hr
    ? Number(data.last_updated_by_hr)
    : null,
  last_review_date: data.last_review_date
    ? new Date(data.last_review_date)
    : null,
});

// Create a new succession plan
const createSuccessionPlan = async (data) => {
  try {
    const reqData = await prisma.hrms_d_succession_plan.create({
      data: {
        ...serializeSuccessionPlanData(data),
        createdby: data.createdby || 1,
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
        succession_updateByHR: {
          select: {
            id: true,
            full_name: true,
          },
        },
        succession_evaluatedBy: {
          select: {
            id: true,
            full_name: true,
          },
        },
        succession_role: {
          select: {
            id: true,
            role_name: true,
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

// Find succession plan by ID
const findSuccessionPlanById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_succession_plan.findUnique({
      where: { id: parseInt(id) },
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

// Update succession plan
const updateSuccessionPlan = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_succession_plan.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeSuccessionPlanData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
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
        succession_updateByHR: {
          select: {
            id: true,
            full_name: true,
          },
        },
        succession_evaluatedBy: {
          select: {
            id: true,
            full_name: true,
          },
        },
        succession_role: {
          select: {
            id: true,
            role_name: true,
          },
        },
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating succession plan: ${error.message}`,
      500
    );
  }
};

// Delete succession plan
const deleteSuccessionPlan = async (id) => {
  try {
    await prisma.hrms_d_succession_plan.delete({
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

    const filters = {};
    if (search) {
      filters.OR = [
        {
          succession_currentHolder: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          succession_potentialSuccessor: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          succession_updateByHR: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          succession_evaluatedBy: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          critical_position: { contains: search.toLowerCase() },
        },
        {
          readiness_level: { contains: search.toLowerCase() },
        },
        {
          status: { contains: search.toLowerCase() },
        },
        {
          notes: { contains: search.toLowerCase() },
        },
        {
          risk_of_loss: { contains: search.toLowerCase() },
        },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.plan_date = { gte: start, lte: end };
      }
    }

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
        succession_updateByHR: {
          select: {
            id: true,
            full_name: true,
          },
        },
        succession_evaluatedBy: {
          select: {
            id: true,
            full_name: true,
          },
        },
        succession_role: {
          select: {
            id: true,
            role_name: true,
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
    throw new CustomError("Error retrieving succession plans", 503);
  }
};

module.exports = {
  createSuccessionPlan,
  findSuccessionPlanById,
  updateSuccessionPlan,
  deleteSuccessionPlan,
  getAllSuccessionPlans,
};
