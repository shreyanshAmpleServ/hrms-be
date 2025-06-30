const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const createHoliday = async (data) => {
  try {
    const finalData = await prisma.hrms_m_holiday_calendar.create({
      data: {
        holiday_name: data.holiday_name,
        holiday_date: data.holiday_date,
        location: data.location,
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
    throw new CustomError(
      `Error creating holiday calender: ${error.message}`,
      500
    );
  }
};

const findHolidayById = async (id) => {
  try {
    const data = await prisma.hrms_m_holiday_calendar.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("Holiday calender not found", 404);
    }
    return data;
  } catch (error) {
    throw new CustomError(
      `Error finding holiday calender by ID: ${error.message}`,
      503
    );
  }
};

const updateHoliday = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_holiday_calendar.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(
      `Error updating holiday calender: ${error.message}`,
      500
    );
  }
};

const deleteHoliday = async (id) => {
  try {
    await prisma.hrms_m_holiday_calendar.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting holiday calender: ${error.message}`,
      500
    );
  }
};

const getAllHoliday = async (
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
      filters.OR = [{ holiday_name: { contains: search.toLowerCase() } }];
    }
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const data = await prisma.hrms_m_holiday_calendar.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_holiday_calendar.count({
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
    throw new CustomError("Error retrieving holiday calender", 503);
  }
};

module.exports = {
  createHoliday,
  findHolidayById,
  updateHoliday,
  deleteHoliday,
  getAllHoliday,
};
