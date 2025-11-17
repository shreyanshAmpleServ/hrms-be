const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const createRatingScale = async (data) => {
  try {
    const finalData = await prisma.hrms_m_rating_scale.create({
      data: {
        rating_value: data.rating_value || null,
        is_active: data.is_active || "Y",

        rating_description: data.rating_description || "",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create rating scale ", error);
    throw new CustomError(`Error creating rating scale: ${error.message}`, 500);
  }
};

const findRatingScaleById = async (id) => {
  try {
    const data = await prisma.hrms_m_rating_scale.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("rating scale not found", 404);
    }
    return data;
  } catch (error) {
    console.log("rating scale By Id  ", error);
    throw new CustomError(
      `Error finding rating scale by ID: ${error.message}`,
      503
    );
  }
};

const updateRatingScale = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_rating_scale.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(`Error updating rating scale: ${error.message}`, 500);
  }
};

const deleteRatingScale = async (id) => {
  try {
    await prisma.hrms_m_rating_scale.delete({
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

// Get all rating scale
const getAllRatingScale = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          rating_description: { contains: search.toLowerCase() },
        },
      ];
    }
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }
    const data = await prisma.hrms_m_rating_scale.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_rating_scale.count({
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
    throw new CustomError("Error retrieving rating scale", 503);
  }
};

module.exports = {
  createRatingScale,
  findRatingScaleById,
  updateRatingScale,
  deleteRatingScale,
  getAllRatingScale,
};
