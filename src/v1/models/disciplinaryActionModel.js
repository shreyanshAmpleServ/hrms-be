const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeData = (data) => {
  const result = {};

  if (data.employee_id !== undefined)
    result.employee_id = Number(data.employee_id);
  if (data.incident_date) result.incident_date = new Date(data.incident_date);
  if (data.incident_description !== undefined)
    result.incident_description = data.incident_description;
  if (data.action_taken !== undefined) result.action_taken = data.action_taken;
  if (data.committee_notes !== undefined)
    result.committee_notes = data.committee_notes;
  if (data.effective_from)
    result.effective_from = new Date(data.effective_from);
  if (data.status !== undefined) result.status = data.status;

  if (data.employee_code !== undefined) {
    const employeeCodeInt = parseInt(data.employee_code, 10);
    if (!isNaN(employeeCodeInt)) {
      result.employee_code = employeeCodeInt;
    } else {
      throw new Error("Invalid employee_code, cannot convert to integer");
    }
  }

  return result;
};

const resolvePenaltyType = async (penaltyType) => {
  if (penaltyType === undefined || penaltyType === null) return null;

  const asInt = parseInt(penaltyType, 10);
  if (!isNaN(asInt)) return asInt;

  const penalty = await prisma.hrms_m_disciplinary_penalty.findFirst({
    where: { penalty_type: penaltyType },
  });
  if (!penalty) {
    throw new CustomError(`Penalty type "${penaltyType}" not found.`, 400);
  }
  return penalty.id;
};

// To create disciplinary action
const createDisciplinaryAction = async (data) => {
  try {
    const employeeId = Number(data.employee_id);
    if (!employeeId || isNaN(employeeId)) {
      throw new CustomError("Invalid or missing employee_id", 400);
    }

    await errorNotExist("hrms_d_employee", employeeId, "Employee");

    const penaltyTypeId = await resolvePenaltyType(data.penalty_type);

    const payload = {
      ...serializeData(data),
      ...(penaltyTypeId !== null && { penalty_type: penaltyTypeId }),
      createdby: Number(data.createdby) || 1,
      createdate: new Date(),
      log_inst: data.log_inst || 1,
    };

    const disciplinaryAction = await prisma.hrms_d_disciplinary_action.create({
      data: payload,
      include: {
        employee: {
          select: {
            full_name: true,
            employee_code: true,
          },
        },
        disciplinary_penalty: {
          select: {
            id: true,
            penalty_type: true,
          },
        },
      },
    });

    return disciplinaryAction;
  } catch (error) {
    throw new CustomError(
      `Error creating disciplinary action: ${error.message}`,
      error.statusCode || 500
    );
  }
};

// To find disciplinary action by id
const findDisciplinaryActionById = async (id) => {
  try {
    const disciplinaryAction =
      await prisma.hrms_d_disciplinary_action.findUnique({
        where: { id: parseInt(id) },
      });
    if (!disciplinaryAction) {
      throw new CustomError(`Disciplinary action not found with id ${id}`, 404);
    }
    return disciplinaryAction;
  } catch (error) {
    throw new CustomError(
      `Error finding disciplinary action by ID: ${error.message}`,
      503
    );
  }
};

// To update disciplinary action
const updateDisciplinaryAction = async (id, data) => {
  try {
    if (!data.employee_id) {
      throw new Error(`Employee is required`);
    }

    await errorNotExist(
      "hrms_d_employee",
      Number(data.employee_id),
      "Employee"
    );

    const penaltyTypeId = await resolvePenaltyType(data.penalty_type);

    const payload = {
      ...serializeData(data),
      penalty_type: penaltyTypeId,
      updatedby: Number(data.updatedby) || null,
      updatedate: new Date(),
    };

    console.log("Update Payload ===>", payload);

    const updatedDisciplinaryAction =
      await prisma.hrms_d_disciplinary_action.update({
        where: { id: parseInt(id) },
        data: payload,
        include: {
          disciplinary_penalty: {
            select: {
              id: true,
              penalty_type: true,
            },
          },
          employee: {
            select: { full_name: true, employee_code: true },
          },
        },
      });

    return updatedDisciplinaryAction;
  } catch (error) {
    throw new CustomError(
      `Error updating disciplinary action: ${error.message}`,
      500
    );
  }
};

// To delete disciplinary action
const deleteDisciplinaryAction = async (id) => {
  try {
    const existingRecord = await prisma.hrms_d_disciplinary_action.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existingRecord) {
      throw new CustomError(`Disciplinary action not found with id ${id}`, 404);
    }

    await prisma.hrms_d_disciplinary_action.delete({
      where: {
        id: parseInt(id),
      },
    });

    return {
      success: true,
      message: `Disciplinary action with ID ${id} deleted successfully.`,
    };
  } catch (error) {
    throw new CustomError(
      `Error deleting disciplinary action: ${error.message}`,
      error.status || 500
    );
  }
};

// To get all disciplinary action
const getAllDisciplinaryAction = async (
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
          employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          status: { contains: search.toLowerCase() },
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
    const datas = await prisma.hrms_d_disciplinary_action.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        employee: {
          select: {
            full_name: true,
            employee_code: true,
          },
        },
        disciplinary_penalty: true,
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_d_disciplinary_action.count({
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
    throw new CustomError(
      `Error retrieving disciplinary actions: ${error.message}`,
      503
    );
  }
};

module.exports = {
  createDisciplinaryAction,
  findDisciplinaryActionById,
  updateDisciplinaryAction,
  deleteDisciplinaryAction,
  getAllDisciplinaryAction,
};
