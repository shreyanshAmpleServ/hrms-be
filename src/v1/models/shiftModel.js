const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { toLowerCase } = require("zod/v4");
const { id } = require("date-fns/locale");
const prisma = new PrismaClient();

// Serialize shift master data
const serializeShiftMasterData = (data) => ({
  shift_name: data.shift_name || "",
  start_time: data.start_time || null,
  end_time: data.end_time || null,
  lunch_time: data.lunch_time ? Number(data.lunch_time) : null,
  daily_working_hours: data.daily_working_hours
    ? Number(data.daily_working_hours)
    : null,
  department_id: data.department_id ? Number(data.department_id) : null,
  number_of_working_days: data.number_of_working_days
    ? Number(data.number_of_working_days)
    : null,
  half_day_working: data.half_day_working || "N",
  half_day_on: data.half_day_on ? Number(data.half_day_on) : null,
  remarks: data.remarks || "",
});

// Create a new shift master
const createShift = async (data) => {
  try {
    const reqData = await prisma.hrms_m_shift_master.create({
      data: {
        ...serializeShiftMasterData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        shift_department_id: {
          select: {
            id: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(`Error creating shift master: ${error.message}`, 500);
  }
};

// Find shift master by ID
const findShiftById = async (id) => {
  try {
    const reqData = await prisma.hrms_m_shift_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Shift master not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding shift master by ID: ${error.message}`,
      503
    );
  }
};

// Update shift master
const updateShift = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_m_shift_master.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeShiftMasterData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        shift_department_id: {
          select: {
            id: true,
          },
        },
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(`Error updating shift master: ${error.message}`, 500);
  }
};

// Delete shift master
const deleteShift = async (id) => {
  try {
    await prisma.hrms_m_shift_master.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting shift master: ${error.message}`, 500);
  }
};

// Get all shift masters with pagination and search
const getAllShift = async (page, size, search, startDate, endDate) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          shift_department_id: {
            select: {
              id: true,
            },
          },
        },
        {
          shift_name: { contains: search.toLowerCase() },
        },
      ];
    }
    // if (search) {
    //   filters.shift_name = { contains: search };
    // }

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
    const data = await prisma.hrms_m_shift_master.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_shift_master.count({
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
    throw new CustomError("Error retrieving shift", 503);
  }
};

module.exports = {
  createShift,
  findShiftById,
  updateShift,
  deleteShift,
  getAllShift,
};
