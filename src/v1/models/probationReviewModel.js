const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { createRequest } = require("./requestsModel");
const { request } = require("express");
const prisma = new PrismaClient();

// Serialize probation review data
const serializeProbationReviewData = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  probation_end_date: data.probation_end_date
    ? new Date(data.probation_end_date)
    : null,
  review_notes: data.review_notes || "",
  confirmation_status: data.confirmation_status || "",
  confirmation_date: data.confirmation_date
    ? new Date(data.confirmation_date)
    : null,
  reviewer_id: data.reviewer_id ? Number(data.reviewer_id) : null,
  review_meeting_date: data.review_meeting_date
    ? new Date(data.review_meeting_date)
    : null,
  performance_rating: data.performance_rating
    ? Number(data.performance_rating)
    : null,
  extension_required: data.extension_required || "",
  extension_reason: data.extension_reason || "",
  extended_till_date: data.extended_till_date
    ? new Date(data.extended_till_date)
    : null,
  next_review_date: data.next_review_date
    ? new Date(data.next_review_date)
    : null,
  final_remarks: data.final_remarks || "",
});

// Create a new probation review
const createProbationReview = async (data) => {
  try {
    const reqData = await prisma.hrms_d_probation_review.create({
      data: {
        ...serializeProbationReviewData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        probation_review_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        probation_reviewer: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });

    await createRequest({
      requester_id: reqData.employee_id,
      request_type: "probation_review",
      reference_id: reqData.id,
      // request_data:
      //   reqData.reason ||
      //   `Leave from ${reqData.start_date} to ${reqData.end_date}`,
      createdby: data.createdby || 1,
      log_inst: data.log_inst || 1,
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating probation review: ${error.message}`,
      500
    );
  }
};

// Find probation review by ID
const findProbationReviewById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_probation_review.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Probation review not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding probation review by ID: ${error.message}`,
      503
    );
  }
};

// Update probation review
const updateProbationReview = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_probation_review.update({
      where: { id: parseInt(id) },
      include: {
        probation_review_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        probation_reviewer: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },

      data: {
        ...serializeProbationReviewData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating probation review: ${error.message}`,
      500
    );
  }
};

// Delete probation review
const deleteProbationReview = async (id) => {
  try {
    await prisma.hrms_d_probation_review.delete({
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

// Get all probation reviews with pagination and search
const getAllProbationReview = async (
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
          probation_review_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          probation_reviewer: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        { review_notes: { contains: search.toLowerCase() } },
        { confirmation_status: { contains: search.toLowerCase() } },
        { extension_reason: { contains: search.toLowerCase() } },
        { final_remarks: { contains: search.toLowerCase() } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.probation_end_date = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_probation_review.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        probation_review_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        probation_reviewer: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    const totalCount = await prisma.hrms_d_probation_review.count({
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
    throw new CustomError("Error retrieving probation reviews", 503);
  }
};

module.exports = {
  createProbationReview,
  findProbationReviewById,
  updateProbationReview,
  deleteProbationReview,
  getAllProbationReview,
};
