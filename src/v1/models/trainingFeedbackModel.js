const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeData = (data) => {
  return {
    employee_id: Number(data.employee_id) || null,
    training_id: Number(data.training_id) || null,
    feedback_text: data.feedback_text || "",
    rating: Number(data.rating) || 0,
  };
};

// Create a new training feedback
const createTrainingFeedback = async (data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    const reqData = await prisma.hrms_d_training_feedback.create({
      data: {
        ...serializeData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        training_employee: true,
        training_details: true,
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating training feedback: ${error.message}`,
      500
    );
  }
};

// Find a training feedback by ID
const findTrainingFeedbackById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_training_feedback.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("training feedback not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding training feedback by ID: ${error.message}`,
      503
    );
  }
};

// Update a training feedback
const updateTrainingFeedback = async (id, data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");

    const updatedTrainingFeedback =
      await prisma.hrms_d_training_feedback.update({
        where: { id: parseInt(id) },
        data: {
          ...serializeData(data),
          updatedby: data.updatedby || 1,
          updatedate: new Date(),
        },
        include: {
          training_employee: true,
          training_details: true,
        },
      });
    return updatedTrainingFeedback;
  } catch (error) {
    throw new CustomError(
      `Error updating training feedback: ${error.message}`,
      500
    );
  }
};

// Delete a training feedback
const deleteTrainingFeedback = async (id) => {
  try {
    await prisma.hrms_d_training_feedback.delete({
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

// Get all training feedback
const getAllTrainingFeedback = async (
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
          training_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          training_details: {
            training_title: { contains: search.toLowerCase() },
          },
        },
        {
          rating: { contains: search.toLowerCase() },
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
    const datas = await prisma.hrms_d_training_feedback.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        training_employee: true,
        training_details: true,
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const totalCount = await prisma.hrms_d_training_feedback.count();
    const totalCount = await prisma.hrms_d_training_feedback.count({
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
    throw new CustomError("Error retrieving training feedback", 503);
  }
};

module.exports = {
  createTrainingFeedback,
  findTrainingFeedbackById,
  updateTrainingFeedback,
  deleteTrainingFeedback,
  getAllTrainingFeedback,
};
