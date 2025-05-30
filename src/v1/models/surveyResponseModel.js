const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize survey response data
const serializeSurveyResponse = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  submitted_on: data.submitted_on ? new Date(data.submitted_on) : null,
  response_text: data.response_text || "",
  survey_id: data.survey_id || "",
});
// Create a new survey response
const createSurveyResponse = async (data) => {
  try {
    const reqData = await prisma.hrms_d_survey_response.create({
      data: {
        ...serializeSurveyResponse(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        survey_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        survey_type: {
          select: {
            id: true,
            survey_title: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating survey response: ${error.message}`,
      500
    );
  }
};

// Find an survey response by ID
const findSurveyResponseById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_survey_response.findUnique({
      where: { id: parseInt(id) },
      include: {
        survey_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        survey_type: {
          select: {
            id: true,
            survey_title: true,
          },
        },
      },
    });
    if (!reqData) {
      throw new CustomError("survey response not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding survey response by ID: ${error.message}`,
      503
    );
  }
};

// Update an survey response
const updateSurveyResponse = async (id, data) => {
  try {
    const payload = {
      ...serializeSurveyResponse(data),
      updatedby: Number(data.updatedby) || 1,
      updatedate: new Date(),
    };
    if (data.employee_id === undefined) {
      delete payload.employee_id;
    }

    const updatedInterview = await prisma.hrms_d_survey_response.update({
      where: { id: parseInt(id) },
      data: payload,
      include: {
        survey_employee: {
          select: { id: true, employee_code: true, full_name: true },
        },
        survey_type: {
          select: {
            id: true,
            survey_title: true,
          },
        },
      },
    });
    return updatedInterview;
  } catch (error) {
    throw new CustomError(
      `Error updating survey response: ${error.message}`,
      500
    );
  }
};

// Delete an survey response
const deleteSurveyResponse = async (id) => {
  try {
    await prisma.hrms_d_survey_response.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting survey response: ${error.message}`,
      500
    );
  }
};

// Get all survey responses with pagination and search
const getAllSurveyResponses = async (
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
          {
            survey_employee: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          {
            survey_type: {
              survey_title: { contains: search.toLowerCase() },
            },
          },
          { response_text: { contains: search.toLowerCase() } },
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

    const datas = await prisma.hrms_d_survey_response.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        survey_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        survey_type: {
          select: {
            id: true,
            survey_title: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_survey_response.count({
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
    throw new CustomError("Error retrieving survey responses", 400);
  }
};

module.exports = {
  createSurveyResponse,
  findSurveyResponseById,
  updateSurveyResponse,
  deleteSurveyResponse,
  getAllSurveyResponses,
};
