const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

// Serialize recognition award data
const serializeRecognitionAward = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  award_title: data.award_title || "",
  description: data.description || "",
  award_date: data.award_date ? new Date(data.award_date) : null,
  nominated_by: data.nominated_by ? Number(data.nominated_by) : null,
});

// Create a new recognition award
const createRecognitionAward = async (data) => {
  try {
    const created = await prisma.hrms_d_recognition_award.create({
      data: {
        ...serializeRecognitionAward(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    // Fetch with relations for employee and nominator names
    return await prisma.hrms_d_recognition_award.findUnique({
      where: { id: created.id },
      include: {
        recognition_award_employee: { select: { id: true, full_name: true } },
        recognition_award_nominated: { select: { id: true, full_name: true } },
      },
    });
  } catch (error) {
    throw new CustomError(
      `Error creating recognition award: ${error.message}`,
      500
    );
  }
};

// Find a recognition award by ID
const findRecognitionAwardById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_recognition_award.findUnique({
      where: { id: parseInt(id) },
      include: {
        recognition_award_employee: { select: { id: true, full_name: true } },
        recognition_award_nominated: { select: { id: true, full_name: true } },
      },
    });
    if (!reqData) {
      throw new CustomError("Recognition award not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding recognition award by ID: ${error.message}`,
      503
    );
  }
};

// Update a recognition award
const updateRecognitionAward = async (id, data) => {
  try {
    const updated = await prisma.hrms_d_recognition_award.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeRecognitionAward(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return await prisma.hrms_d_recognition_award.findUnique({
      where: { id: updated.id },
      include: {
        recognition_award_employee: { select: { id: true, full_name: true } },
        recognition_award_nominated: { select: { id: true, full_name: true } },
      },
    });
  } catch (error) {
    throw new CustomError(
      `Error updating recognition award: ${error.message}`,
      500
    );
  }
};

// Delete a recognition award
const deleteRecognitionAward = async (id) => {
  try {
    await prisma.hrms_d_recognition_award.delete({
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

const getAllRecognitionAwards = async (
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
            recognition_award_employee: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          {
            recognition_award_nominated: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          { award_title: { contains: search.toLowerCase() } },
          { description: { contains: search.toLowerCase() } },
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

    const datas = await prisma.hrms_d_recognition_award.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        recognition_award_employee: { select: { id: true, full_name: true } },
        recognition_award_nominated: { select: { id: true, full_name: true } },
      },
    });

    const totalCount = await prisma.hrms_d_recognition_award.count({
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
    throw new CustomError("Error retrieving recognition awards", 400);
  }
};

module.exports = {
  createRecognitionAward,
  findRecognitionAwardById,
  updateRecognitionAward,
  deleteRecognitionAward,
  getAllRecognitionAwards,
};
