const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

// Serialize exit interview data
const serializeExitInterview = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  interview_date: data.interview_date ? new Date(data.interview_date) : null,
  reason_for_leaving: data.reason_for_leaving || "",
  feedback: data.feedback || "",
  suggestions: data.suggestions || "",
});
// Create a new exit interview
const createExitInterview = async (data) => {
  try {
    const reqData = await prisma.hrms_d_exit_interview.create({
      data: {
        ...serializeExitInterview(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        exit_interview_employee: {
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
      `Error creating exit interview: ${error.message}`,
      500
    );
  }
};

// Find an exit interview by ID
const findExitInterviewById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_exit_interview.findUnique({
      where: { id: parseInt(id) },
      include: {
        exit_interview_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    if (!reqData) {
      throw new CustomError("Exit interview not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding exit interview by ID: ${error.message}`,
      503
    );
  }
};

// Update an exit interview
const updateExitInterview = async (id, data) => {
  try {
    const payload = {
      ...serializeExitInterview(data),
      updatedby: Number(data.updatedby) || 1,
      updatedate: new Date(),
    };
    if (data.employee_id === undefined) {
      delete payload.employee_id;
    }

    const updatedInterview = await prisma.hrms_d_exit_interview.update({
      where: { id: parseInt(id) },
      data: payload,
      include: {
        exit_interview_employee: {
          select: { id: true, employee_code: true, full_name: true },
        },
      },
    });
    return updatedInterview;
  } catch (error) {
    throw new CustomError(
      `Error updating exit interview: ${error.message}`,
      500
    );
  }
};

// Delete an exit interview
const deleteExitInterview = async (id) => {
  try {
    await prisma.hrms_d_exit_interview.delete({
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

// Get all exit interviews
const getAllExitInterviews = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filterConditions = [];

    if (search) {
      filterConditions.push({
        OR: [
          {
            exit_interview_employee: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          { reason_for_leaving: { contains: search.toLowerCase() } },
          { feedback: { contains: search.toLowerCase() } },
          { suggestions: { contains: search.toLowerCase() } },
        ],
      });
    }
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

    const filters =
      filterConditions.length > 0 ? { AND: filterConditions } : {};

    const datas = await prisma.hrms_d_exit_interview.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        exit_interview_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_exit_interview.count({
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
    throw new CustomError("Error retrieving exit interviews", 400);
  }
};

module.exports = {
  createExitInterview,
  findExitInterviewById,
  updateExitInterview,
  deleteExitInterview,
  getAllExitInterviews,
};
