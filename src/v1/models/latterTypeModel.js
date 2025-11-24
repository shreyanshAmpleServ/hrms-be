const CustomError = require("../../utils/CustomError");
const { prisma } = require("../../utils/prismaProxy.js");

const createLatterType = async (data) => {
  try {
    const finalData = await prisma.hrms_m_letter_type.create({
      data: {
        letter_name: data.letter_name || "",
        template_path: data.template_path || "",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return finalData;
  } catch (error) {
    console.error("Create letter type error:", error);
    throw new CustomError(`Error creating letter type: ${error.message}`, 500);
  }
};

const findLatterTypeById = async (id) => {
  try {
    const data = await prisma.hrms_m_letter_type.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("Letter type not found", 404);
    }
    return data;
  } catch (error) {
    console.error("Find letter type error:", error);
    throw new CustomError(
      `Error finding letter type by ID: ${error.message}`,
      503
    );
  }
};

const updateLatterType = async (id, data) => {
  try {
    // Remove id from data if it exists
    const { id: _, ...updateData } = data;

    const updatedData = await prisma.hrms_m_letter_type.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updatedate: new Date(),
      },
    });

    return updatedData;
  } catch (error) {
    console.error("Update letter type error:", error);
    throw new CustomError(`Error updating letter type: ${error.message}`, 500);
  }
};

const deleteLatterType = async (id) => {
  try {
    await prisma.hrms_m_letter_type.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400
      );
    } else {
      throw new CustomError(
        error.meta?.constraint || "Error deleting letter type",
        500
      );
    }
  }
};

const getAllLatterType = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
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
          letter_name: { contains: search.toLowerCase() },
        },
      ];
    }

    // Handle date range
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

    // Handle is_active
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const data = await prisma.hrms_m_letter_type.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_letter_type.count({
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
    console.error("Get all letter types error:", error);
    throw new CustomError("Error retrieving letter types", 503);
  }
};

module.exports = {
  createLatterType,
  findLatterTypeById,
  updateLatterType,
  deleteLatterType,
  getAllLatterType,
};
