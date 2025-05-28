const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize training session data
const serializeTrainingSession = (data) => ({
  training_title: data.training_title || "",
  trainer_name:   data.trainer_name   || "",
  training_date:  data.training_date ? new Date(data.training_date) : null,
  location:       data.location       || "",
  training_type:  data.training_type || "",
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
    });
    return reqData;
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
const deleteTrainingSession = async (id) => {
  try {
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
const getAllTrainingSessions = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filterConditions = [];

    // Search OR condition on multiple fields
   if (search) {
  filterConditions.push({
    OR: [
      { training_title: { contains: search } },
      { trainer_name: { contains: search } },
      { location: { contains: search } },
      { training_type: { contains: search } },
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
    const filters = filterConditions.length > 0 ? { AND: filterConditions } : {};
console.log('Filters:', JSON.stringify(filters, null, 2));

    const datas = await prisma.hrms_d_training_session.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_d_training_session.count({ where: filters });

    return {
      data: datas,
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
}