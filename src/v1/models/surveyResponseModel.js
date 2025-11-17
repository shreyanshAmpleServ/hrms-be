/**
 * @fileoverview Survey response model handling CRUD operations for survey responses
 * @module surveyResponseModel
 */

const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");
const { z } = require("zod");

/**
 * Zod schema for validating survey response data
 * @type {z.ZodObject}
 */
const surveyResponseSchema = z.object({
  employee_id: z
    .number({
      required_error: "Employee ID is required",
    })
    .min(1, "Employee ID is required"),
  submitted_on: z
    .string({
      required_error: "Submitted date is required",
    })
    .min(1, "Submitted date is required")
    .transform((val) => new Date(val)),
  response_text: z
    .string({
      required_error: "Response text is required",
    })
    .min(1, "Response text is required"),
  survey_id: z
    .number({
      required_error: "Survey ID is required",
    })
    .min(1, "Survey ID is required"),
});

/**
 * Validates and serializes survey response data
 * @param {Object} data - Raw survey response data
 * @returns {Object} Validated and serialized survey response data
 */
const serializeSurveyResponse = (data) => {
  const validatedData = surveyResponseSchema.parse(data);
  return {
    employee_id: validatedData.employee_id,
    submitted_on: validatedData.submitted_on,
    response_text: validatedData.response_text,
    survey_id: validatedData.survey_id,
  };
};

/**
 * Creates a new survey response
 * @param {Object} data - Survey response data to create
 * @returns {Promise<Object>} Created survey response with related data
 * @throws {CustomError} If validation fails or database error occurs
 */
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
          select: { id: true, employee_code: true, full_name: true },
        },
        survey_type: { select: { id: true, survey_title: true } },
      },
    });
    return reqData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new CustomError(error.errors[0].message, 400);
    }
    throw new CustomError(
      `Error creating survey response: ${error.message}`,
      500
    );
  }
};

/**
 * Finds a survey response by ID
 * @param {number|string} id - Survey response ID
 * @returns {Promise<Object>} Survey response with related data
 * @throws {CustomError} If survey response not found or database error occurs
 */
const findSurveyResponseById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_survey_response.findUnique({
      where: { id: parseInt(id) },
      include: {
        survey_employee: {
          select: { id: true, employee_code: true, full_name: true },
        },
        survey_type: { select: { id: true, survey_title: true } },
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

/**
 * Updates a survey response
 * @param {number|string} id - Survey response ID to update
 * @param {Object} data - Updated survey response data
 * @returns {Promise<Object>} Updated survey response with related data
 * @throws {CustomError} If validation fails or database error occurs
 */
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
        survey_type: { select: { id: true, survey_title: true } },
      },
    });
    return updatedInterview;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new CustomError(error.errors[0].message, 400);
    }
    throw new CustomError(
      `Error updating survey response: ${error.message}`,
      500
    );
  }
};

/**
 * Deletes a survey response
 * @param {number|string} id - Survey response ID to delete
 * @throws {CustomError} If database error occurs
 */
const deleteSurveyResponse = async (id) => {
  try {
    await prisma.hrms_d_survey_response.delete({
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

/**
 * Gets all survey responses with pagination and filtering
 * @param {string} [search] - Search term for filtering responses
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [size=10] - Number of items per page
 * @param {string} [startDate] - Start date for date range filter
 * @param {string} [endDate] - End date for date range filter
 * @returns {Promise<Object>} Paginated survey responses with metadata
 * @throws {CustomError} If database error occurs
 */
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

    if (search) {
      filterConditions.push({
        OR: [
          {
            survey_employee: { full_name: { contains: search.toLowerCase() } },
          },
          { survey_type: { survey_title: { contains: search.toLowerCase() } } },
          { response_text: { contains: search.toLowerCase() } },
        ],
      });
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filterConditions.push({ createdate: { gte: start, lte: end } });
      }
    }

    const filters =
      filterConditions.length > 0 ? { AND: filterConditions } : {};

    const datas = await prisma.hrms_d_survey_response.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        survey_employee: {
          select: { id: true, employee_code: true, full_name: true },
        },
        survey_type: { select: { id: true, survey_title: true } },
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
