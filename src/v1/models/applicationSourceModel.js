const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

// Serialize input data
const serializeApplicationSource = (data) => ({
  source_name: data.source_name,
});

// Create application source
const createApplicationSource = async (data) => {
  try {
    const result = await prisma.hrms_m_application_source.create({
      data: {
        ...serializeApplicationSource(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(
      `Error creating application source: ${error.message}`,
      500
    );
  }
};

// Find application source by ID
const findApplicationSourceById = async (id) => {
  try {
    const source = await prisma.hrms_m_application_source.findUnique({
      where: { id: parseInt(id) },
    });
    if (!source) {
      throw new CustomError("Application source not found", 404);
    }
    return source;
  } catch (error) {
    throw new CustomError(
      `Error finding application source: ${error.message}`,
      503
    );
  }
};

// Update application source
const updateApplicationSource = async (id, data) => {
  try {
    const updated = await prisma.hrms_m_application_source.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeApplicationSource(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updated;
  } catch (error) {
    throw new CustomError(
      `Error updating application source: ${error.message}`,
      500
    );
  }
};

// Delete application source
const deleteApplicationSource = async (id) => {
  try {
    await prisma.hrms_m_application_source.delete({
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

// Get all application sources (with pagination + optional search)
const getAllApplicationSource = async (search, page, size) => {
  try {
    page = page && page > 0 ? page : 1;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};
    if (search) {
      filters.source_name = { contains: search, mode: "insensitive" };
    }

    const data = await prisma.hrms_m_application_source.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_application_source.count({
      where: filters,
    });

    return {
      data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError(
      `Error retrieving application sources: ${error.message}`,
      503
    );
  }
};

module.exports = {
  createApplicationSource,
  findApplicationSourceById,
  updateApplicationSource,
  deleteApplicationSource,
  getAllApplicationSource,
};
