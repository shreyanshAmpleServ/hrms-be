const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");
const { id } = require("zod/v4/locales");

// Serialize disciplinary action data
const serializeDisciplinaryActionData = (data) => ({
  employee_id: Number(data.employee_id),
  incident_date: data.incident_date ? new Date(data.incident_date) : null,
  incident_description: data.incident_description || "",
  action_taken: data.action_taken || "",
  committee_notes: data.committee_notes || "",
  penalty_type: data.penalty_type ? Number(data.penalty_type) : null,
  effective_from: data.effective_from ? new Date(data.effective_from) : null,
  status: data.status || "",
  reviewed_by: data.reviewed_by ? Number(data.reviewed_by) : null,
  review_date: data.review_date ? new Date(data.review_date) : null,
  remarks: data.remarks || "",
});

// Create a new disciplinary action
const createDisciplinaryAction = async (data) => {
  try {
    const reqData = await prisma.hrms_d_disciplinary_action.create({
      data: {
        ...serializeDisciplinaryActionData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
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
        disciplinary_reviewed_by: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating disciplinary action: ${error.message}`,
      500
    );
  }
};

// Find disciplinary action by ID
const findDisciplinaryActionById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_disciplinary_action.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Disciplinary action not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding disciplinary action by ID: ${error.message}`,
      503
    );
  }
};

// Update disciplinary action
const updateDisciplinaryAction = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_disciplinary_action.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeDisciplinaryActionData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
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
        disciplinary_reviewed_by: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating disciplinary action: ${error.message}`,
      500
    );
  }
};

// Delete disciplinary action
const deleteDisciplinaryAction = async (id) => {
  try {
    await prisma.hrms_d_disciplinary_action.delete({
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

// Get all disciplinary actions with pagination and search
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
            is: {
              full_name: {
                contains: search,
              },
            },
          },
        },
        {
          disciplinary_reviewed_by: {
            is: {
              full_name: {
                contains: search,
              },
            },
          },
        },
        {
          incident_description: {
            contains: search,
          },
        },
        {
          action_taken: {
            contains: search,
          },
        },
        {
          status: {
            contains: search,
          },
        },
        {
          remarks: {
            contains: search,
          },
        },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.incident_date = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_disciplinary_action.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
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
        disciplinary_reviewed_by: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });
    const totalCount = await prisma.hrms_d_disciplinary_action.count({
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
    throw new CustomError("Error retrieving disciplinary actions", 503);
  }
};

const updateDisciplinaryActionStatus = async (id, data) => {
  try {
    const disciplinaryActionId = parseInt(id);
    if (isNaN(disciplinaryActionId)) {
      throw new CustomError("Invalid disciplinary action ID", 400);
    }

    const existingDisciplinaryAction =
      await prisma.hrms_d_disciplinary_action.findUnique({
        where: { id: disciplinaryActionId },
      });

    if (!existingDisciplinaryAction) {
      throw new CustomError(
        `Disciplinary action with ID ${disciplinaryActionId} not found`,
        404
      );
    }

    const updateData = {
      status: data.status,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };

    if (data.status === "Resolved") {
      updateData.reviewed_by = Number(data.reviewed_by) || null;
      updateData.review_date = new Date();
    } else if (data.status === "Closed") {
      updateData.reviewed_by = Number(data.reviewed_by) || null;
      updateData.review_date = new Date();
    } else {
      updateData.reviewed_by = null;
      updateData.review_date = null;
    }
    const updatedEntry = await prisma.hrms_d_disciplinary_action.update({
      where: { id: disciplinaryActionId },
      data: updateData,
      include: {
        disciplinary_reviewed_by: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    return updatedEntry;
  } catch (error) {
    console.log("Error updating disciplinary action", error);

    throw new CustomError(
      `Error updating disciplinary action: ${error.message}`,
      500
    );
  }
};
module.exports = {
  createDisciplinaryAction,
  findDisciplinaryActionById,
  updateDisciplinaryAction,
  deleteDisciplinaryAction,
  getAllDisciplinaryAction,
  updateDisciplinaryActionStatus,
};
