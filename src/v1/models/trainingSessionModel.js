const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize training session data
const serializeTrainingSession = (data) => ({
  training_title: data.training_title || "",
  trainer_id: data.trainer_id ? Number(data.trainer_id) : null, // use trainer_id here
  training_date: data.training_date ? new Date(data.training_date) : null,
  location: data.location || "",
  training_type: data.training_type || "",
});

// Create a new training session
const createTrainingSession = async (data) => {
  try {
    const reqData = await prisma.hrms_d_training_session.create({
      data: {
        ...serializeTrainingSession(data),
        createdby: Number(data.createdby) || 1,
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
      },
    });

    return {
      ...reqData,
      trainer_name: reqData.training_session_employee
        ? reqData.training_session_employee.full_name
        : null,
    };
  } catch (error) {
    throw new CustomError(
      `Error creating training session: ${error.message}`,
      500
    );
  }
};

// Find a training session by ID
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

// Update a training session
const updateTrainingSession = async (id, data) => {
  try {
    const updatedSession = await prisma.hrms_d_training_session.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeTrainingSession(data),
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

// Delete a training session
// Delete a training session (after deleting related feedback)
const deleteTrainingSession = async (id) => {
  try {
    // First, delete related feedback records
    await prisma.hrms_d_training_feedback.deleteMany({
      where: {
        training_id: parseInt(id),
      },
    });

    // Then delete the training session
    await prisma.hrms_d_training_session.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting training session: ${error.message}`,
      500
    );
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
    const skip = (page - 1) * size;

    const filterConditions = [];

    if (search) {
      filterConditions.push({
        OR: [
          {
            training_session_employee: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          { training_title: { contains: search.toLowerCase() } },
          // trainer_name removed here
          { location: { contains: search.toLowerCase() } },
          { training_type: { contains: search.toLowerCase() } },
        ],
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start) && !isNaN(end)) {
        filterConditions.push({
          createdate: { gte: start, lte: end },
        });
      }
    }

    const filters = filterConditions.length ? { AND: filterConditions } : {};

    const sessions = await prisma.hrms_d_training_session.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        training_session_employee: {
          select: { id: true, full_name: true },
        },
      },
    });

    const data = sessions.map(({ training_session_employee, ...rest }) => ({
      ...rest,
      trainer_id: training_session_employee?.id || null,
      trainer_name: training_session_employee?.full_name || null,
    }));

    const totalCount = await prisma.hrms_d_training_session.count({
      where: filters,
    });

    return {
      data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.error(error);
    throw new CustomError("Error retrieving training sessions", 400);
  }
};

module.exports = {
  createTrainingSession,
  findTrainingSessionById,
  updateTrainingSession,
  deleteTrainingSession,
  getAllTrainingSessions,
};
