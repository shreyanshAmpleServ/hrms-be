const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { includes } = require("zod/v4");
const prisma = new PrismaClient();

const timeStringToDecimal = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return null;
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return parseFloat((hours + minutes / 60 + seconds / 3600).toFixed(2));
};

// Serialize attendance data
const serializeAttendanceData = async (data) => {
  const checkIn = data.check_in_time ? new Date(data.check_in_time) : null;
  const checkOut = data.check_out_time ? new Date(data.check_out_time) : null;

  let working_hours = null;
  let status = data.status;

  if (checkIn && checkOut && checkOut > checkIn) {
    const diffMs = checkOut - checkIn;
    working_hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  }

  if (!status && working_hours !== null && data.employee_id) {
    status = await getStatusFromWorkingHours(data.employee_id, working_hours);
  }

  return {
    employee_id: Number(data.employee_id),
    attendance_date: data.attendance_date
      ? new Date(data.attendance_date)
      : null,
    check_in_time: checkIn,
    check_out_time: checkOut,
    status,
    remarks: data.remarks || "",
    working_hours,
  };
};

const getStatusFromWorkingHours = async (employeeId, working_hours) => {
  if (!employeeId || working_hours == null) return null;

  const employee = await prisma.hrms_d_employee.findUnique({
    where: { id: employeeId },
    select: { shift_id: true },
  });

  if (!employee?.shift_id) return "Absent";

  const shift = await prisma.hrms_m_shift_master.findUnique({
    where: { id: employee.shift_id },
    select: { daily_working_hours: true },
  });

  if (!shift?.daily_working_hours) return "Absent";

  const fullDay = parseFloat(shift.daily_working_hours);
  const halfDay = fullDay / 2;

  if (working_hours >= fullDay) return "Present";
  if (working_hours >= halfDay) return "Half Day";
  return "Absent";
};

const createDailyAttendance = async (data) => {
  try {
    const serializedData = await serializeAttendanceData(data);
    const reqData = await prisma.hrms_d_daily_attendance_entry.create({
      data: {
        ...serializedData,
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
    const serializedData = await serializeAttendanceData(data);

    const updatedEntry = await prisma.hrms_d_daily_attendance_entry.update({
      where: { id: parseInt(id) },
      data: {
        ...serializedData,
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
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

// const getAllDailyAttendance = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate
// ) => {
//   try {
//     page = !page || page == 0 ? 1 : page;
//     size = size || 10;
//     const skip = (page - 1) * size || 0;

//     const filters = {};

//     if (search) {
//       filters.OR = [
//         {
//           hrms_daily_attendance_employee: {
//             full_name: { contains: search.toLowerCase() },
//           },
//         },
//         {
//           hrms_daily_attendance_employee: {
//             employee_code: { contains: search.toLowerCase() },
//           },
//         },
//         { status: { contains: search.toLowerCase() } },
//         { remarks: { contains: search.toLowerCase() } },
//       ];
//     }

//     let start, end;
//     if (startDate && endDate) {
//       start = new Date(startDate);
//       end = new Date(endDate);
//     } else {
//       const now = new Date();
//       start = new Date(now.getFullYear(), now.getMonth(), 1);
//       end = new Date(now);
//     }

//     if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//       filters.attendance_date = { gte: start, lte: end };
//     }

//     const datas = await prisma.hrms_d_daily_attendance_entry.findMany({
//       where: filters,
//       skip,
//       take: size,
//       orderBy: [{ attendance_date: "desc" }],
//       include: {
//         hrms_daily_attendance_employee: {
//           select: {
//             id: true,
//             employee_code: true,
//             full_name: true,
//           },
//         },
//       },
//     });

//     const totalCount = await prisma.hrms_d_daily_attendance_entry.count({
//       where: filters,
//     });

//     return {
//       data: datas,
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(totalCount / size),
//       totalCount,
//     };
//   } catch (error) {
//     throw new CustomError("Error retrieving attendance entries", 503);
//   }
// };

// const getAllDailyAttendance = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate
// ) => {
//   try {
//     page = !page || page == 0 ? 1 : page;
//     size = size || 10;
//     const skip = (page - 1) * size || 0;

//     const filters = {};

//     if (search) {
//       filters.OR = [
//         {
//           hrms_daily_attendance_employee: {
//             full_name: { contains: search.toLowerCase() },
//           },
//         },
//         {
//           hrms_daily_attendance_employee: {
//             employee_code: { contains: search.toLowerCase() },
//           },
//         },
//         { status: { contains: search.toLowerCase() } },
//         { remarks: { contains: search.toLowerCase() } },
//       ];
//     }

//     let start, end;
//     if (startDate && endDate) {
//       start = new Date(startDate);
//       end = new Date(endDate);
//     } else {
//       const now = new Date();
//       start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));
//       end = new Date(
//         Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 0, 0, 0)
//       );
//     }

//     if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//       filters.attendance_date = { gte: start, lte: end };
//     }

//     const attendanceEntries =
//       await prisma.hrms_d_daily_attendance_entry.findMany({
//         where: filters,
//         orderBy: [{ attendance_date: "asc" }],
//         include: {
//           hrms_daily_attendance_employee: {
//             select: {
//               id: true,
//               employee_code: true,
//               full_name: true,
//             },
//           },
//         },
//       });

//     const attendanceMap = {};
//     attendanceEntries.forEach((entry) => {
//       const key = entry.attendance_date.toISOString().split("T")[0];
//       attendanceMap[key] = entry;
//     });

//     const allDates = [];
//     const current = new Date(start);

//     while (current <= end) {
//       const dateStr = current.toISOString().split("T")[0];
//       const data = attendanceMap[dateStr] || {
//         attendance_date: new Date(dateStr),
//         status: null,
//         remarks: null,
//         hrms_daily_attendance_employee: null,
//       };
//       allDates.push(data);
//       current.setUTCDate(current.getUTCDate() + 1);
//     }

//     const paginated = allDates.slice(skip, skip + size);

//     return {
//       data: paginated,
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(allDates.length / size),
//       totalCount: allDates.length,
//     };
//   } catch (error) {
//     console.error(error);
//     throw new CustomError("Error retrieving attendance entries", 503);
//   }
// };

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

    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      filters.attendance_date = { gte: start, lte: end };
    }

    const attendanceEntries =
      await prisma.hrms_d_daily_attendance_entry.findMany({
        where: filters,
        orderBy: [{ attendance_date: "asc" }],
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

    const attendanceMap = {};
    attendanceEntries.forEach((entry) => {
      const key = entry.attendance_date.toISOString().split("T")[0];
      attendanceMap[key] = entry;
    });

    const allDates = [];
    const current = new Date(start);
    const final = new Date(end);

    while (current <= final) {
      const dateStr = current.toISOString().split("T")[0];
      const entry = attendanceMap[dateStr];

      if (entry) {
        allDates.push({
          id: entry.id,
          attendance_date: entry.attendance_date,
          status: entry.status,
          remarks: entry.remarks,
          hrms_daily_attendance_employee: entry.hrms_daily_attendance_employee,
        });
      } else {
        allDates.push({
          id: null,
          attendance_date: new Date(dateStr),
          status: null,
          remarks: null,
          hrms_daily_attendance_employee: null,
        });
      }

      current.setUTCDate(current.getUTCDate() + 1);
    }

    const paginated = allDates.slice(skip, skip + size);

    return {
      data: paginated,
      currentPage: page,
      size,
      totalPages: Math.ceil(allDates.length / size),
      totalCount: allDates.length,
    };
  } catch (error) {
    console.error(error);
    throw new CustomError("Error retrieving attendance entries", 503);
  }
};

const getAttendanceSummaryByEmployee = async (
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
    if (startDate || endDate) {
      filters.attendance_date = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          filters.attendance_date.gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          filters.attendance_date.lte = end;
        }
      }
    } else {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      filters.attendance_date = {
        gte: firstDay,
        lte: lastDay,
      };
    }

    if (search) {
      filters.hrms_daily_attendance_employee = {
        OR: [
          { full_name: { contains: search.toLowerCase() } },
          { employee_code: { contains: search.toLowerCase() } },
        ],
      };
    }

    const summary = await prisma.hrms_d_daily_attendance_entry.groupBy({
      by: ["employee_id", "status"],
      where: filters,
      _count: { status: true },
    });

    const employeeWhere = {};
    if (search) {
      employeeWhere.OR = [
        { full_name: { contains: search.toLowerCase() } },
        { employee_code: { contains: search.toLowerCase() } },
      ];
    }

    const totalCount = await prisma.hrms_d_employee.count({
      where: employeeWhere,
    });

    const employees = await prisma.hrms_d_employee.findMany({
      where: employeeWhere,
      select: {
        id: true,
        employee_code: true,
        full_name: true,
        department_id: true,
      },
      skip,
      take: size,
    });

    const normalize = (status) => status.toLowerCase().replace(/ /g, "_");

    const data = employees.map((emp) => {
      const empSummary = summary.filter((s) => s.employee_id === emp.id);
      return {
        ...emp,
        present:
          empSummary.find((s) => normalize(s.status) === "present")?._count
            .status || 0,
        absent:
          empSummary.find((s) => normalize(s.status) === "absent")?._count
            .status || 0,
        half_day:
          empSummary.find((s) => normalize(s.status) === "half_day")?._count
            .status || 0,
        late:
          empSummary.find((s) => normalize(s.status) === "late")?._count
            .status || 0,
      };
    });

    return {
      data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.error(error);
    throw new CustomError("Error generating attendance summary", 503);
  }
};

const findAttendanceByEmployeeId = async (employeeId, startDate, endDate) => {
  try {
    const empId = Number(employeeId);

    const employee = await prisma.hrms_d_employee.findUnique({
      where: { id: empId },
      select: {
        id: true,
        full_name: true,
        employee_code: true,
        department_id: true,
      },
    });

    if (!employee) throw new CustomError("Employee not found", 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = startDate ? new Date(startDate) : new Date(today);
    let end = endDate ? new Date(endDate) : new Date(today);

    if (!startDate && !endDate) {
      start.setDate(start.getDate() - 29);
    }

    if (isNaN(start) || isNaN(end)) {
      throw new CustomError("Invalid date range provided", 400);
    }

    const attendanceData = await prisma.hrms_d_daily_attendance_entry.findMany({
      where: {
        employee_id: empId,
        attendance_date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { attendance_date: "asc" },
      select: {
        id: true,
        attendance_date: true,
        status: true,
        remarks: true,
        check_in_time: true,
        check_out_time: true,
        working_hours: true,
      },
    });

    const summary = {
      present: 0,
      absent: 0,
      leave: 0,
      late: 0,
      half_Day: 0,
    };

    attendanceData.forEach((entry) => {
      const status = entry.status.toLowerCase();
      if (status === "present") summary.present++;
      else if (status === "absent") summary.absent++;
      else if (status === "leave") summary.leave++;
      else if (status === "late") summary.late++;
      else if (status === "half day" || status === "half_day")
        summary.half_Day++;
    });

    const allDates = [];
    for (let d = new Date(end); d >= start; d.setDate(d.getDate() - 1)) {
      allDates.push(new Date(d));
    }

    const attendanceMap = new Map();
    attendanceData.forEach((entry) => {
      const key = new Date(entry.attendance_date).toISOString().split("T")[0];
      if (!attendanceMap.has(key)) {
        attendanceMap.set(key, entry);
      }
    });

    const attendanceList = allDates.map((date) => {
      const key = date.toISOString().split("T")[0];
      const entry = attendanceMap.get(key);
      return {
        attendance_date: key,
        id: entry?.id || null,
        status: entry?.status || null,
        remarks: entry?.remarks || null,
        check_in_time: entry?.check_in_time || null,
        check_out_time: entry?.check_out_time || null,
        working_hours: entry?.working_hours || null,
      };
    });

    return { employee, summary, attendanceList };
  } catch (error) {
    throw new CustomError(
      `Error retrieving attendance entry: ${error.message}`,
      500
    );
  }
};

module.exports = {
  createDailyAttendance,
  findDailyAttendanceById,
  updateDailyAttendance,
  deleteDailyAttendance,
  getAllDailyAttendance,
  getAttendanceSummaryByEmployee,
  findAttendanceByEmployeeId,
};
