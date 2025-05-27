const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeData = (data) => {
  return {
    employee_id: Number(data.employee_id) || null,
    incident_date: data.incident_date || null,
    incident_description: data.incident_description || null,
    action_taken: data.action_taken || "",
    committee_notes: data.committee_notes || "",
    penalty_type: data.penalty_type || "",
    effective_from: data.effective_from || null,
    status: data.status || "",
  };
};

// To create disciplinary action
const createDisciplinaryAction = async (data) => {
  try {
    await errorNotExist("hrms_d_employee", data.id, "Employee");

    const disciplinaryAction = await prisma.hrms_d_disciplinary_action.create({
      data: {
        ...serializeData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    return disciplinaryAction;
  } catch (error) {
    throw new CustomError(
      `Error creating disciplinary action: ${error.message}`,
      500
    );
  }
};

// To find  disciplinary action by id
const findDisciplinaryActionById = async (id) => {
  try {
    const disciplinaryAction =
      await prisma.hrms_d_disciplinary_action.findUnique({
        where: {
          id: parseInt(id),
        },
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
    if (data.employee_id) {
      await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    }
    const updatedDisciplinaryAction =
      await prisma.hrms_d_disciplinary_action.update({
        where: {
          id: parseInt(id),
        },
        data: {
          ...serializeData(data),
          updatedby: data.updatedby || 1,
          updatedate: new Date(),
        },
      });
    return updatedDisciplinaryAction;
  } catch (error) {
    throw new CustomError(
      `Error updating disciplinary action: ${error.message} ,500`
    );
  }
};

// To delete disciplinary action
const deleteDisciplinaryAction = async (id) => {
  try {
    const deleteDisciplinaryAction =
      await prisma.hrms_d_disciplinary_action.delete({
        where: {
          id: parseInt(id),
        },
      });
  } catch (error) {
    throw new CustomError(
      `Error deleting disciplinary action: ${error.message},500`
    );
  }
};

//To get all disciplinary action
const getAllDisciplinaryAction = async (
  page,
  size,
  search,
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
        { incident_description: { contains: search } },
        { action_taken: { contains: search } },
        { committee_notes: { contains: search } },
        { penalty_type: { contains: search } },
        { status: { contains: search } },
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

    const disciplinaryActions =
      await prisma.hrms_d_disciplinary_action.findMany({
        where: filters,
        skip: skip,
        take: size,
        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

    const totalCount = await prisma.hrms_d_disciplinary_action.count({
      where: filters,
    });

    return {
      data: disciplinaryActions,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving disciplinary actions", 503);
  }
};

module.exports = {
  createDisciplinaryAction,
  findDisciplinaryActionById,
  updateDisciplinaryAction,
  deleteDisciplinaryAction,
  getAllDisciplinaryAction,
};
