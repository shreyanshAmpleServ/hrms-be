const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

const createAwardType = async (data) => {
  try {
    const finalData = await prisma.hrms_m_award_type.create({
      data: {
        award_name: data.award_name || "",
        description: data.description || "",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        is_active: data.is_active || "Y",

        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create award type ", error);
    throw new CustomError(`Error creating award type: ${error.message}`, 500);
  }
};

const findAwardTypeById = async (id) => {
  try {
    const data = await prisma.hrms_m_award_type.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("award type not found", 404);
    }
    return data;
  } catch (error) {
    console.log("award type By Id  ", error);
    throw new CustomError(
      `Error finding award type by ID: ${error.message}`,
      503
    );
  }
};

const updateAwardType = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_award_type.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(`Error updating award type: ${error.message}`, 500);
  }
};

const deleteAwardType = async (id) => {
  try {
    await prisma.hrms_m_award_type.delete({
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

// Get all award type
const getAllAwardType = async (
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
          award_name: { contains: search.toLowerCase() },
        },
      ];
    }

    // if (startDate && endDate) {
    //   const start = new Date(startDate);
    //   const end = new Date(endDate);

    //   if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    //     filters.createdate = {
    //       gte: start,
    //       lte: end,
    //     };
    //   }
    // }
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }
    const data = await prisma.hrms_m_award_type.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_award_type.count({
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
    throw new CustomError("Error retrieving award type", 503);
  }
};

module.exports = {
  createAwardType,
  findAwardTypeById,
  updateAwardType,
  deleteAwardType,
  getAllAwardType,
};
