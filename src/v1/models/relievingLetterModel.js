const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize relieving letter data
const serializeRelievingLetter = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  relieving_date: data.relieving_date ? new Date(data.relieving_date) : null,
  remarks: data.remarks || "",
});

// Create a new relieving letter
const createRelievingLetter = async (data) => {
  try {
    const reqData = await prisma.hrms_d_relieving_letter.create({
      data: {
        ...serializeRelievingLetter(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        relieving_letter_employee: {
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
      `Error creating relieving letter: ${error.message}`,
      500
    );
  }
};

// Find a relieving letter by ID
const findRelievingLetterById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_relieving_letter.findUnique({
      where: { id: parseInt(id) },
      include: {
        relieving_letter_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    if (!reqData) {
      throw new CustomError("Relieving letter not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding relieving letter by ID: ${error.message}`,
      503
    );
  }
};

// Update a relieving letter
const updateRelievingLetter = async (id, data) => {
  try {
    const updatedLetter = await prisma.hrms_d_relieving_letter.update({
      where: { id: parseInt(id) },
      include: {
        relieving_letter_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
      data: {
        ...serializeRelievingLetter(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedLetter;
  } catch (error) {
    throw new CustomError(
      `Error updating relieving letter: ${error.message}`,
      500
    );
  }
};

// Delete a relieving letter
const deleteRelievingLetter = async (id) => {
  try {
    await prisma.hrms_d_relieving_letter.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting relieving letter: ${error.message}`,
      500
    );
  }
};

// Get all relieving letters
const getAllRelievingLetters = async (
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
            relieving_letter_employee: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          {
            remarks: { contains: search.toLowerCase() },
          },
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

    const datas = await prisma.hrms_d_relieving_letter.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        relieving_letter_employee: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_relieving_letter.count({
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
    throw new CustomError("Error retrieving relieving letters", 400);
  }
};

module.exports = {
  createRelievingLetter,
  findRelievingLetterById,
  updateRelievingLetter,
  deleteRelievingLetter,
  getAllRelievingLetters,
};
