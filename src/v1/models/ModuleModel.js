const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Create a new Module Related To
const createModuleRelatedTo = async (data) => {
  try {
    const calls = await prisma.hrms_m_module.create({
      data: {
        ...data,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
    });
    return calls;
  } catch (error) {
    throw new CustomError(
      `Error creating Module Related To : ${error.message}`,
      500
    );
  }
};

// Update a Module Related To
const updateModuleRelatedTo = async (id, data) => {
  try {
    const updatedCalls = await prisma.hrms_m_module.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedCalls;
  } catch (error) {
    throw new CustomError(
      `Error updating Module Related To : ${error.message}`,
      500
    );
  }
};

// Delete a Module Related To
const deleteModuleRelatedTo = async (id) => {
  try {
    await prisma.hrms_m_module.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting Module Related To : ${error.message}`,
      500
    );
  }
};

// Get related To Data
const getModuleRelatedTos = async (search, page, size, is_active) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.module_name = { contains: search.toLowerCase() };
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }
    const relatedTo = await prisma.hrms_m_module.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [
        { module_name: "asc" },
        { updatedate: "desc" },
        { createdate: "desc" },
      ],
    });
    const totalCount = await prisma.hrms_m_module.count({
      where: filters,
    });

    return {
      data: relatedTo,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error modulues model get :", error);
    throw new CustomError("Error retrieving Module Related To", 503);
  }
};

module.exports = {
  createModuleRelatedTo,
  updateModuleRelatedTo,
  deleteModuleRelatedTo,
  getModuleRelatedTos,
};
