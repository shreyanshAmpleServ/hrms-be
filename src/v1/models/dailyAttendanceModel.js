const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { includes } = require("zod/v4");
const prisma = new PrismaClient();

// Serialize attendance data
const serializeAttendanceData = (data) => ({
  employee_id: Number(data.employee_id),
  attendance_date: data.attendance_date ? new Date(data.attendance_date) : null,
  check_in_time: data.check_in_time ? new Date(data.check_in_time) : null,
  check_out_time: data.check_out_time ? new Date(data.check_out_time) : null,
  status: data.status || "",
  remarks: data.remarks || "",
});

// Create a new attendance entry
const createDailyAttendance = async (data) => {
  try {
    const reqData = await prisma.hrms_d_daily_attendance_entry.create({
      data: {
        ...serializeAttendanceData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        hrms_daily_attendance_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating attendance entry: ${error.message}`,
      500
    );
  }
};

// Find attendance entry by ID
const findDailyAttendanceById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_daily_attendance_entry.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Attendance entry not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding attendance entry by ID: ${error.message}`,
      503
    );
  }
};

// Update attendance entry
const updateDailyAttendance = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_daily_attendance_entry.update({
      where: { id: parseInt(id) },
      include: {
        hrms_daily_attendance_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
      data: {
        ...serializeAttendanceData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating attendance entry: ${error.message}`,
      500
    );
  }
};

// Delete attendance entry
const deleteDailyAttendance = async (id) => {
  try {
    await prisma.hrms_d_daily_attendance_entry.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting attendance entry: ${error.message}`,
      500
    );
  }
};

// Get all attendance entries with pagination and search
const getAllDailyAttendance = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          hrms_daily_attendance_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          hrms_daily_attendance_employee: {
            employee_code: { contains: search.toLowerCase() },
          },
        },
        { status: { contains: search.toLowerCase() } },
        { remarks: { contains: search.toLowerCase() } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.attendance_date = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_daily_attendance_entry.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        hrms_daily_attendance_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    const totalCount = await prisma.hrms_d_daily_attendance_entry.count({
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
    throw new CustomError("Error retrieving attendance entries", 503);
  }
};

module.exports = {
  createDailyAttendance,
  findDailyAttendanceById,
  updateDailyAttendance,
  deleteDailyAttendance,
  getAllDailyAttendance,
};
