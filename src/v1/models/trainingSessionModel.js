const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize training session data
const serializeTrainingSessionData = (data) => ({
  training_title: data.training_title || "",
  trainer_id: data.trainer_id ? Number(data.trainer_id) : null,
  training_date: data.training_date ? new Date(data.training_date) : null,
  location: data.location || "",
  training_type: data.training_type || "",
  training_objective: data.training_objective || "",
  department_id: data.department_id ? Number(data.department_id) : null,
  audience_level: data.audience_level || "",
  participant_limit: data.participant_limit
    ? Number(data.participant_limit)
    : null,
  duration_hours: data.duration_hours ? Number(data.duration_hours) : null,
  training_material_path: data.training_material_path || "",
  evaluation_required:
    typeof data.evaluation_required === "boolean"
      ? data.evaluation_required
      : data.evaluation_required === "true",
  feedback_required:
    typeof data.feedback_required === "boolean"
      ? data.feedback_required
      : data.feedback_required === "true",

  training_status: data.training_status || "",
});

// Create a new training session
const createTrainingSession = async (data) => {
  try {
    const reqData = await prisma.hrms_d_training_session.create({
      data: {
        ...serializeTrainingSessionData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        training_session_employee: {
          select: {
            id: true,
            full_name: true,
          },
        },
        training_session_departmentID: {
          select: {
            id: true,
            department_name: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating training session: ${error.message}`,
      500
    );
  }
};

// Find training session by ID
const findTrainingSessionById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_training_session.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Training session not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding training session by ID: ${error.message}`,
      503
    );
  }
};

// Update training session
const updateTrainingSession = async (id, data) => {
  try {
    const updatedSession = await prisma.hrms_d_training_session.update({
      where: { id: parseInt(id) },
      include: {
        training_session_employee: {
          select: {
            id: true,
            full_name: true,
          },
        },
        training_session_departmentID: {
          select: {
            id: true,
            department_name: true,
          },
        },
      },
      data: {
        ...serializeTrainingSessionData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedSession;
  } catch (error) {
    throw new CustomError(
      `Error updating training session: ${error.message}`,
      500
    );
  }
};

// Delete training session
const deleteTrainingSession = async (id) => {
  try {
    await prisma.hrms_d_training_session.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record cannot be deleted because it has associated data other records. Please remove the dependent data first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

// Get all training sessions with pagination and search
const getAllTrainingSessions = async (
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
          training_session_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          training_session_departmentID: {
            department_name: { contains: search.toLowerCase() },
          },
        },
        {
          training_title: {
            contains: search.toLowerCase(),
          },
        },
        { location: { contains: search.toLowerCase() } },
        {
          training_type: {
            contains: search.toLowerCase(),
          },
        },
        {
          training_status: {
            contains: search.toLowerCase(),
          },
        },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.training_date = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_training_session.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        training_session_employee: {
          select: {
            id: true,
            full_name: true,
          },
        },
        training_session_departmentID: {
          select: {
            id: true,
            department_name: true,
          },
        },
      },
    });
    const totalCount = await prisma.hrms_d_training_session.count({
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
    throw new CustomError("Error retrieving training sessions", 503);
  }
};

const updateTrainingSessionStatus = async (id, data) => {
  try {
    const trainingSessionId = parseInt(id);
    if (isNaN(trainingSessionId)) {
      throw new CustomError("Invalid Training session ID", 400);
    }

    const validStatuses = ["Planned", "Ongoing", "Completed", "Cancelled"];
    if (!validStatuses.includes(data.status)) {
      throw new CustomError("Invalid training status", 400);
    }

    const existingTrainingSession =
      await prisma.hrms_d_training_session.findUnique({
        where: { id: trainingSessionId },
      });

    if (!existingTrainingSession) {
      throw new CustomError(
        `Training session with ID ${trainingSessionId} not found`,
        404
      );
    }

    const updatedSession = await prisma.hrms_d_training_session.update({
      where: { id: trainingSessionId },
      data: {
        training_status: data.status,
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });

    return updatedSession;
  } catch (error) {
    console.error("Error updating training session status:", error);
    throw new CustomError(
      `Error updating training session status: ${error.message}`,
      error.status || 500
    );
  }
};

module.exports = {
  createTrainingSession,
  findTrainingSessionById,
  updateTrainingSession,
  deleteTrainingSession,
  getAllTrainingSessions,
  updateTrainingSessionStatus,
};
