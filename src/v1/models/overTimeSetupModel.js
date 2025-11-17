const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

// Serialize input data
const serializeOvertimeSetupData = (data) => ({
  days_code: data.days_code || null,
  wage_type: data.wage_type || null,
  hourly_rate_hike: data.hourly_rate_hike
    ? parseFloat(data.hourly_rate_hike)
    : 0,
  maximum_overtime_allowed:
    data.maximum_overtime_allowed !== undefined &&
    data.maximum_overtime_allowed !== null
      ? String(data.maximum_overtime_allowed)
      : "0",
});
// CREATE
const createOverTimeSetup = async (data) => {
  try {
    const result = await prisma.hrms_m_overtime_setup.create({
      data: {
        ...serializeOvertimeSetupData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(
      `Error creating overtime setup: ${error.message}`,
      500
    );
  }
};

// READ ALL with pagination + search
const getAllOverTimeSetup = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;
    const filters = {};

    if (search) {
      filters.OR = [
        { days_code: { contains: search.toLowerCase() } },
        { wage_type: { contains: search.toLowerCase() } },
        { maximum_overtime_allowed: { contains: search.toLowerCase() } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const data = await prisma.hrms_m_overtime_setup.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: { id: "desc" },
    });

    const totalCount = await prisma.hrms_m_overtime_setup.count({
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
    throw new CustomError("Error fetching overtime setups", 500);
  }
};

// READ by ID
const findOverTimeSetupById = async (id) => {
  try {
    const result = await prisma.hrms_m_overtime_setup.findUnique({
      where: { id: parseInt(id) },
    });
    if (!result) throw new CustomError("Overtime setup not found", 404);
    return result;
  } catch (error) {
    throw new CustomError(
      `Error getting overtime setup: ${error.message}`,
      500
    );
  }
};

// UPDATE
const updateOverTimeSetup = async (id, data) => {
  try {
    const updated = await prisma.hrms_m_overtime_setup.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeOvertimeSetupData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updated;
  } catch (error) {
    throw new CustomError(
      `Error updating overtime setup: ${error.message}`,
      500
    );
  }
};

// DELETE
const deleteOverTimeSetup = async (id) => {
  try {
    await prisma.hrms_m_overtime_setup.delete({
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

module.exports = {
  createOverTimeSetup,
  getAllOverTimeSetup,
  findOverTimeSetupById,
  updateOverTimeSetup,
  deleteOverTimeSetup,
};
