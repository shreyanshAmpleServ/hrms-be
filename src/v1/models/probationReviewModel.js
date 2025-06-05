const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const serializeProbationReview = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  probation_end_date: data.probation_end_date
    ? new Date(data.probation_end_date)
    : null,
  review_notes: data.review_notes || "",
  confirmation_status: data.confirmation_status || "",
  confirmation_date: data.confirmation_date
    ? new Date(data.confirmation_date)
    : null,
});

const createProbationReview = async (data) => {
  try {
    const reqData = await prisma.hrms_d_probation_review.create({
      data: {
        ...serializeProbationReview(data),
        createdby: Number(data.createdby) || 1,
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
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating probation review: ${error.message}`,
      500
    );
  }
};

// Find a probation review by ID
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

// Update a probation review
const updateProbationReview = async (id, data) => {
  try {
    const updatedReview = await prisma.hrms_d_probation_review.update({
      where: { id: parseInt(id) },
      include: {
        probation_review_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
      data: {
        ...serializeProbationReview(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedReview;
  } catch (error) {
    throw new CustomError(
      `Error updating probation review: ${error.message}`,
      500
    );
  }
};
// Delete a probation review
const deleteProbationReview = async (id) => {
  try {
    await prisma.hrms_d_probation_review.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting probation review: ${error.message}`,
      500
    );
  }
};

// Get all probation reviews with pagination and filtering
const getAllProbationReviews = async (
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
            probation_review_employee: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          { review_notes: { contains: search.toLowerCase() } },
          { confirmation_status: { contains: search.toLowerCase() } },
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
    throw new CustomError("Error retrieving probation reviews", 400);
  }
};

module.exports = {
  createProbationReview,
  findProbationReviewById,
  updateProbationReview,
  deleteProbationReview,
  getAllProbationReviews,
};
