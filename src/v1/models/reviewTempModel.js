const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const createReviewTemp = async (data) => {
  try {
    const finalData = await prisma.hrms_m_review_template.create({
      data: {
        template_name: data.template_name || "",
        valid_from: data.valid_from || new Date(),
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create review template ", error);
    throw new CustomError(
      `Error creating review template: ${error.message}`,
      500
    );
  }
};

const findReviewTempById = async (id) => {
  try {
    const data = await prisma.hrms_m_review_template.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("review template not found", 404);
    }
    return data;
  } catch (error) {
    console.log("review template By Id  ", error);
    throw new CustomError(
      `Error finding review template by ID: ${error.message}`,
      503
    );
  }
};

const updateReviewTemp = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_review_template.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(
      `Error updating review template: ${error.message}`,
      500
    );
  }
};

const deleteReviewTemp = async (id) => {
  try {
    await prisma.hrms_m_review_template.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting review template: ${error.message}`,
      500
    );
  }
};

// Get all review template
const getAllReviewTemp = async (page, size, search) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          template_name: { contains: search.toLowerCase() },
        },
      ];
    }

    const data = await prisma.hrms_m_review_template.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_review_template.count({
      where: filters,
    });
    return {
      data: data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving review template", 503);
  }
};

module.exports = {
  createReviewTemp,
  findReviewTempById,
  updateReviewTemp,
  deleteReviewTemp,
  getAllReviewTemp,
};
