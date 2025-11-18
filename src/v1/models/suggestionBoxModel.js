const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

// Serialize employee suggestion data
const serializeEmployeeSuggestion = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  suggestion_text: data.suggestion_text || "",
  votes: data.votes ? Number(data.votes) : 0,
  submitted_on: data.submitted_on ? new Date(data.submitted_on) : new Date(),
});

// Create a new suggestion box
const createSuggestionBox = async (data) => {
  try {
    const created = await prisma.hrms_d_employee_suggestion.create({
      data: {
        ...serializeEmployeeSuggestion(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    return await prisma.hrms_d_employee_suggestion.findUnique({
      where: { id: created.id },
      include: {
        suggestion_box_employee: { select: { id: true, full_name: true } },
      },
    });
  } catch (error) {
    throw new CustomError(
      `Error creating suggestion box: ${error.message}`,
      500
    );
  }
};

// Find a suggestion box by ID
const findSuggestionBoxById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_employee_suggestion.findUnique({
      where: { id: parseInt(id) },
      include: {
        suggestion_box_employee: { select: { id: true, full_name: true } },
      },
    });
    if (!reqData) {
      throw new CustomError("Suggestion box not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding suggestion box by ID: ${error.message}`,
      503
    );
  }
};

// Update a suggestion box
const updateSuggestionBox = async (id, data) => {
  try {
    const updated = await prisma.hrms_d_employee_suggestion.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeEmployeeSuggestion(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    // Fetch with relations for employee name
    return await prisma.hrms_d_employee_suggestion.findUnique({
      where: { id: updated.id },
      include: {
        suggestion_box_employee: { select: { id: true, full_name: true } },
      },
    });
  } catch (error) {
    throw new CustomError(
      `Error updating suggestion box: ${error.message}`,
      500
    );
  }
};

// Delete a suggestion box
const deleteSuggestionBox = async (id) => {
  try {
    await prisma.hrms_d_employee_suggestion.delete({
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

// Get all suggestion boxes
const getAllSuggestionBox = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filterConditions = [];

    if (search) {
      filterConditions.push({
        OR: [
          {
            suggestion_box_employee: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          {
            suggestion_text: { contains: search.toLowerCase() },
          },
          {
            suggestion_text: { contains: search.toLowerCase() },
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

    const datas = await prisma.hrms_d_employee_suggestion.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        suggestion_box_employee: { select: { id: true, full_name: true } },
      },
    });

    const totalCount = await prisma.hrms_d_employee_suggestion.count({
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
    throw new CustomError("Error retrieving employee suggestions", 400);
  }
};

module.exports = {
  createSuggestionBox,
  findSuggestionBoxById,
  updateSuggestionBox,
  deleteSuggestionBox,
  getAllSuggestionBox,
};
