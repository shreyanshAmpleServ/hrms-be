const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const serializeHiringStageValueData = (data) => ({
  value: data.value || "",
});

const createHiringStageValue = async (data) => {
  try {
    const newRecord = await prisma.hrms_d_hiring_stage_value.create({
      data: {
        ...serializeHiringStageValueData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });

    return newRecord;
  } catch (error) {
    throw new CustomError(
      `Error creating hiring stage value: ${error.message}`,
      500
    );
  }
};

const getHiringStageValueById = async (id) => {
  try {
    const record = await prisma.hrms_d_hiring_stage_value.findUnique({
      where: { id: parseInt(id) },
    });
    if (!record) throw new CustomError("Hiring stage value not found", 404);
    return record;
  } catch (error) {
    throw new CustomError(
      `Error finding hiring stage value by ID: ${error.message}`,
      503
    );
  }
};

const updateHiringStageValue = async (id, data) => {
  try {
    const updatedRecord = await prisma.hrms_d_hiring_stage_value.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeHiringStageValueData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedRecord;
  } catch (error) {
    throw new CustomError(
      `Error updating hiring stage value: ${error.message}`,
      500
    );
  }
};

const deleteHiringStageValue = async (id) => {
  try {
    await prisma.hrms_d_hiring_stage_value.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is linked to other data. Please remove the related entries first.",
        400
      );
    } else {
      throw new CustomError(error.meta?.constraint || error.message, 500);
    }
  }
};

const getAllHiringStageValues = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : parseInt(page);
    size = size ? parseInt(size) : 10;
    const skip = (page - 1) * size;

    const filters = {};
    const andFilters = [];

    if (search) {
      andFilters.push({
        value: { contains: search.toLowerCase() },
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        andFilters.push({
          createdate: { gte: start, lte: end },
        });
      }
    }

    if (andFilters.length > 0) {
      filters.AND = andFilters;
    }

    const records = await prisma.hrms_d_hiring_stage_value.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_d_hiring_stage_value.count({
      where: filters,
    });

    return {
      data: records,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError(
      `Error retrieving hiring stage values: ${error.message}`,
      503
    );
  }
};

module.exports = {
  createHiringStageValue,
  getHiringStageValueById,
  updateHiringStageValue,
  deleteHiringStageValue,
  getAllHiringStageValues,
};
