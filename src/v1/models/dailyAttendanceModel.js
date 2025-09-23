const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { includes } = require("zod/v4");
const prisma = new PrismaClient();
const { DateTime, Interval } = require("luxon");

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
const upsertDailyAttendance = async (id, data) => {
  try {
    const serializedData = await serializeAttendanceData(data);

    let updatedEntry;

    if (id) {
      updatedEntry = await prisma.hrms_d_daily_attendance_entry.update({
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
    } else {
      updatedEntry = await prisma.hrms_d_daily_attendance_entry.create({
        data: {
          employee_id: data.employee_id,
          attendance_date: new Date(data.attendance_date),
          ...serializedData,
          createdby: data.createdby || 1,
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
    }
    return updatedEntry;
  } catch (error) {
    console.log(`Error in updating attendance entry: ${error.message}`);
    throw new CustomError(` ${error.message}`);
  }
};

// Delete attendance entry
const deleteDailyAttendance = async (id) => {
  try {
    await prisma.hrms_d_daily_attendance_entry.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record cannot be deleted because it has associated data other records. Please remove the dependent data first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

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

const calculateOvertimeHours = (checkIn, checkOut, standardHours = 8) => {
  if (!checkIn || !checkOut) return 0;

  let inTime = DateTime.fromISO(checkIn.toISOString());
  let outTime = DateTime.fromISO(checkOut.toISOString());

  if (outTime < inTime) {
    outTime = outTime.plus({ days: 1 });
  }

  const workedHours = Interval.fromDateTimes(inTime, outTime).length("hours");
  return Math.max(0, parseFloat((workedHours - standardHours).toFixed(2)));
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

    const attendanceForOvertime =
      await prisma.hrms_d_daily_attendance_entry.findMany({
        where: {
          ...filters,
          check_in_time: { not: null },
          check_out_time: { not: null },
        },
        select: {
          employee_id: true,
          check_in_time: true,
          check_out_time: true,
        },
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

    const employeeOvertimeMap = {};
    attendanceForOvertime.forEach((record) => {
      const { employee_id, check_in_time, check_out_time } = record;
      if (!employeeOvertimeMap[employee_id]) {
        employeeOvertimeMap[employee_id] = 0;
      }
      employeeOvertimeMap[employee_id] += calculateOvertimeHours(
        check_in_time,
        check_out_time
      );
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
        overtime_hours: parseFloat(
          (employeeOvertimeMap[emp.id] || 0).toFixed(2)
        ),
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
    if (!empId) throw new CustomError("Invalid employee ID", 400);

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

    const start = new Date(startDate + "T00:00:00.000Z");
    const end = new Date(endDate + "T23:59:59.999Z");

    if (isNaN(start) || isNaN(end)) {
      throw new CustomError("Invalid date range provided", 400);
    }

    const attendanceEntries =
      await prisma.hrms_d_daily_attendance_entry.findMany({
        where: {
          employee_id: empId,
          attendance_date: { gte: start, lte: end },
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
      total_overtime: 0,
    };

    attendanceEntries.forEach((entry) => {
      const status = entry.status?.toLowerCase();
      if (status === "present") summary.present++;
      else if (status === "absent") summary.absent++;
      else if (status === "leave") summary.leave++;
      else if (status === "late") summary.late++;
      else if (status === "half day" || status === "half_day")
        summary.half_Day++;

      summary.total_overtime += calculateOvertimeHours(
        entry.check_in_time,
        entry.check_out_time
      );
    });

    // Map attendance by date for easier iteration
    const attendanceMap = {};
    attendanceEntries.forEach((entry) => {
      const key = entry.attendance_date.toISOString().split("T")[0];
      attendanceMap[key] = entry;
    });

    // Build full date list with details
    const allDates = [];
    let current = new Date(startDate + "T00:00:00Z");
    const endDateObj = new Date(endDate + "T00:00:00Z");

    while (current <= endDateObj) {
      const dateStr = current.toISOString().split("T")[0];
      const entry = attendanceMap[dateStr];

      allDates.push({
        attendance_date: dateStr,
        id: entry?.id || null,
        status: entry?.status || null,
        remarks: entry?.remarks || null,
        check_in_time: entry?.check_in_time || null,
        check_out_time: entry?.check_out_time || null,
        working_hours: entry?.working_hours || null,
        overtime_hours: entry
          ? calculateOvertimeHours(entry.check_in_time, entry.check_out_time)
          : 0,
      });

      current.setUTCDate(current.getUTCDate() + 1);
    }

    summary.total_overtime = parseFloat(summary.total_overtime.toFixed(2));

    return { employee, summary, attendanceList: allDates };
  } catch (error) {
    console.error("Error retrieving attendance entry:", error);
    throw new CustomError(error.message, 500);
  }
};

const getManagerEmployees = async (manager_id, search, page, take) => {
  const skip = (page - 1) * take;

  const whereCondition = {
    hrms_manager: {
      id: manager_id,
    },

    ...(search && {
      OR: [
        { first_name: { contains: search.toLowerCase() } },
        { last_name: { contains: search.toLowerCase() } },
        { employee_code: { contains: search.toLowerCase() } },
        { email: { contains: search } },
      ],
    }),
  };

  const [employees, totalCount] = await Promise.all([
    prisma.hrms_d_employee.findMany({
      where: whereCondition,
      select: {
        id: true,
        employee_code: true,
        first_name: true,
        last_name: true,
        email: true,
        phone_number: true,
        hrms_employee_designation: {
          select: {
            designation_name: true,
          },
        },
        hrms_employee_department: {
          select: {
            department_name: true,
          },
        },
      },
      skip,
      take,
      orderBy: { first_name: "asc" },
    }),
    prisma.hrms_d_employee.count({
      where: whereCondition,
    }),
  ]);

  return {
    data: employees,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / take),
  };
};

const getManagerTeamAttendance = async (
  manager_id,
  search,
  _page,
  _size,
  startDate,
  endDate,
  employeeId
) => {
  try {
    const managerEmployees = await prisma.hrms_d_employee.findMany({
      where: {
        manager_id: parseInt(manager_id),
        status: "Active",
      },
      select: { id: true },
    });

    const employeeIds = managerEmployees.map((emp) => emp.id);

    if (employeeIds.length === 0) {
      return { data: [] };
    }

    const whereCondition = { employee_id: { in: employeeIds } };

    if (employeeId) whereCondition.employee_id = parseInt(employeeId);

    if (startDate && endDate) {
      whereCondition.attendance_date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      whereCondition.attendance_date = { gte: today, lt: tomorrow };
    }

    if (search) {
      whereCondition.OR = [
        {
          hrms_daily_attendance_employee: {
            some: { full_name: { contains: search, mode: "insensitive" } },
          },
        },
        {
          hrms_daily_attendance_employee: {
            some: { employee_code: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }

    const attendanceRecords =
      await prisma.hrms_d_daily_attendance_entry.findMany({
        where: whereCondition,
        select: {
          id: true,
          status: true,
          check_in_time: true,
          check_out_time: true,
          manager_verified: true,
          hrms_daily_attendance_employee: {
            select: {
              id: true,
              employee_code: true,
              full_name: true,
              profile_pic: true,
              email: true,
              hrms_employee_designation: { select: { designation_name: true } },
              hrms_employee_department: { select: { department_name: true } },
            },
          },
        },
        orderBy: [{ attendance_date: "desc" }],
      });

    const enhancedRecords = attendanceRecords.map((record) => ({
      ...record,
      manager_verified: record.manager_verified || "P",
    }));

    return { data: enhancedRecords };
  } catch (error) {
    console.error("Error in getManagerTeamAttendance:", error);
    throw new CustomError("Failed to fetch team attendance", 500);
  }
};

const getAllHRUsers = async () => {
  try {
    const hrByDesignation = await prisma.hrms_d_employee.findMany({
      where: {
        status: "Active",
        hrms_employee_designation: {
          designation_name: { contains: "Head HR" },
        },
      },
      select: {
        id: true,
        employee_code: true,
        full_name: true,
        email: true,
        phone_number: true,
        hrms_employee_designation: {
          select: { designation_name: true },
        },
      },
    });

    console.log(`Found ${hrByDesignation.length} HR employees by department`);

    const allHrEmployees = [...hrByDesignation];
    const uniqueHrEmployees = allHrEmployees.filter(
      (employee, index, self) =>
        index === self.findIndex((e) => e.id === employee.id)
    );

    console.log(`Total unique HR employees found: ${uniqueHrEmployees.length}`);

    return uniqueHrEmployees.map((employee) => ({
      employee_id: employee.id,
      empCode: employee.employee_code,
      name: employee.full_name,
      email: employee.email,
      phone: employee.phone_number,
      department: employee.hrms_employee_department?.department_name,
      designation: employee.hrms_employee_designation?.designation_name,
      displayName: `${employee.full_name} (${employee.employee_code}) - ${
        employee.hrms_employee_designation?.designation_name || "HR"
      }`,
    }));
  } catch (error) {
    console.error("Error fetching HR employees:", error);
    throw new CustomError("Failed to fetch HR users: " + error.message, 500);
  }
};

const verifyAttendanceByManager = async (
  manager_id,
  attendanceId,
  verificationStatus,
  remarks
) => {
  try {
    const updatedRecord = await prisma.hrms_d_daily_attendance_entry.update({
      where: { id: parseInt(attendanceId) },
      data: {
        manager_verified: verificationStatus,
        manager_verification_date: new Date(),
        manager_remarks: remarks || null,
        verified_by_manager_id: parseInt(managerId),
        updatedate: new Date(),
      },
      include: {
        hrms_daily_attendance_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedRecord,
      message: `Attendance ${verificationStatus.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.error("Error verifying attendance by manager:", error);
    throw new CustomError("Failed to verify attendance", 500);
  }
};

const verifyAttendanceWithManualHR = async (
  manager_id,
  attendance_id,
  verification_status,
  remarks,
  logInst,
  selected_hr_userId,
  notify_HR = true
) => {
  try {
    const updatedRecord = await prisma.hrms_d_daily_attendance_entry.update({
      where: { id: parseInt(attendance_id) },
      data: {
        manager_verified: verification_status,
        manager_verification_date: new Date(),
        manager_remarks: remarks || null,
        verified_by_manager_id: parseInt(manager_id),
        updatedate: new Date(),
      },
      include: {
        hrms_daily_attendance_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    let notificationResult = null;
    if (notify_HR && selected_hr_userId) {
      notificationResult = await createHRNotification(
        parseInt(selected_hr_userId),
        attendance_id,
        manager_id,
        verification_status,
        remarks,
        logInst
      );
    }

    return {
      success: true,
      data: updatedRecord,
      notification: notificationResult,
      message: `Attendance ${verification_status.toLowerCase()}${
        notify_HR ? " and HR notified" : ""
      }`,
    };
  } catch (error) {
    console.error("Error verifying attendance with manual HR:", error);
    throw new CustomError(
      "Failed to verify attendance with manual HR notification",
      500
    );
  }
};

const bulkVerifyWithManualHR = async (
  manager_id,
  attendanceIds,
  verificationStatus,
  remarks,
  logInst,
  selectedHRUserId,
  notifyHR = true
) => {
  try {
    const results = [];
    const errors = [];

    for (const attendanceId of attendanceIds) {
      try {
        const result = await verifyAttendanceWithManualHR(
          manager_id,
          attendanceId,
          verificationStatus,
          remarks,
          logInst,
          selectedHRUserId,
          notifyHR
        );
        results.push(result);
      } catch (error) {
        errors.push({
          attendanceId,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      processed: results.length,
      errors: errors.length,
      results,
      errors,
      message: `Processed ${results.length} records, ${errors.length} errors`,
    };
  } catch (error) {
    console.error("Error in bulk verify with manual HR:", error);
    throw new CustomError("Failed to process bulk verification", 500);
  }
};

const createHRNotification = async (
  hrUserId,
  attendanceId,
  manager_id,
  verificationStatus,
  remarks,
  logInst
) => {
  try {
    const notification = await prisma.hrms_d_notification_log.create({
      data: {
        employee_id: parseInt(hrUserId),
        message_title: `Attendance ${verificationStatus}`,
        message_body: `Manager has ${verificationStatus.toLowerCase()} attendance record #${attendanceId}. ${
          remarks ? "Remarks: " + remarks : ""
        }`,
        channel: "SYSTEM",
        status: "SENT",
        sent_on: new Date(),
        createdate: new Date(),
        createdby: parseInt(manager_id),
        log_inst: logInst || 1,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating HR notification:", error);
    return null;
  }
};

const getVerificationStatusForHR = async (
  search,
  page = 1,
  size = 20,
  startDate,
  endDate,
  verificationStatus,
  manager_id
) => {
  try {
    const skip = (page - 1) * size;
    const take = parseInt(size);

    const whereCondition = {
      manager_verified: { not: null },
    };

    if (verificationStatus) {
      whereCondition.manager_verified = verificationStatus;
    }

    if (manager_id) {
      whereCondition.verified_by_manager_id = parseInt(manager_id);
    }

    if (startDate && endDate) {
      whereCondition.attendance_date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (search) {
      whereCondition.OR = [
        {
          hrms_daily_attendance_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          hrms_daily_attendance_employee: {
            employee_code: { contains: earch.toLowerCase() },
          },
        },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.hrms_d_daily_attendance_entry.findMany({
        where: whereCondition,
        include: {
          hrms_daily_attendance_employee: {
            select: {
              id: true,
              employee_code: true,
              full_name: true,
              email: true,
              hrms_employee_designation: {
                select: { designation_name: true },
              },
              hrms_employee_department: {
                select: { department_name: true },
              },
            },
          },
        },
        skip,
        take,
        orderBy: [
          { manager_verification_date: "desc" },
          { attendance_date: "desc" },
        ],
      }),
      prisma.hrms_d_daily_attendance_entry.count({ where: whereCondition }),
    ]);

    // Get summary statistics
    const summary = await prisma.hrms_d_daily_attendance_entry.groupBy({
      by: ["manager_verified"],
      where: {
        manager_verified: { not: null },
        ...(startDate &&
          endDate && {
            attendance_date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
      },
      _count: true,
    });

    const summaryStats = summary.reduce((acc, item) => {
      acc[item.manager_verified] = item._count;
      return acc;
    }, {});

    return {
      data: records,
      pagination: {
        currentPage: parseInt(page),
        pageSize: take,
        totalRecords: total,
        totalPages: Math.ceil(total / take),
      },
      summary: {
        ...summaryStats,
        total: total,
      },
    };
  } catch (error) {
    console.error("Error in getVerificationStatusForHR:", error);
    throw new CustomError("Failed to fetch verification status", 500);
  }
};

const getVerificationSummary = async (startDate, endDate, manager_id) => {
  try {
    const whereCondition = {
      manager_verified: { not: null },
    };

    if (startDate && endDate) {
      whereCondition.attendance_date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (manager_id) {
      whereCondition.verified_by_manager_id = parseInt(manager_id);
    }

    const verificationStats =
      await prisma.hrms_d_daily_attendance_entry.groupBy({
        by: ["manager_verified"],
        where: whereCondition,
        _count: true,
      });

    const managerStatsRaw = await prisma.hrms_d_daily_attendance_entry.groupBy({
      by: ["verified_by_manager_id"],
      where: whereCondition,
      _count: true,
    });

    const managerIds = managerStatsRaw.map((s) => s.verified_by_manager_id);
    const managers = await prisma.hrms_d_employee.findMany({
      where: { id: { in: managerIds } },
      select: { id: true, full_name: true, employee_code: true },
    });

    const managerMap = managers.reduce((acc, m) => {
      acc[m.id] = m;
      return acc;
    }, {});

    const managerStats = managerStatsRaw.map((stat) => ({
      manager_id: stat.verified_by_manager_id,
      manager_name: managerMap[stat.verified_by_manager_id]?.full_name || null,
      employee_code:
        managerMap[stat.verified_by_manager_id]?.employee_code || null,
      verification_count: stat._count,
    }));

    const recentVerifications =
      await prisma.hrms_d_daily_attendance_entry.findMany({
        where: whereCondition,
        include: {
          hrms_daily_attendance_employee: {
            select: {
              full_name: true,
              employee_code: true,
            },
          },
        },
        orderBy: { manager_verification_date: "desc" },
        take: 10,
      });

    return {
      verificationStats: verificationStats.reduce((acc, item) => {
        acc[item.manager_verified] = item._count;
        return acc;
      }, {}),
      managerStats,
      recentVerifications: recentVerifications.map((record) => ({
        id: record.id,
        employee_name: record.hrms_daily_attendance_employee.full_name,
        employee_code: record.hrms_daily_attendance_employee.employee_code,
        verification_status: record.manager_verified,
        verification_date: record.manager_verification_date,
        attendance_date: record.attendance_date,
      })),
    };
  } catch (error) {
    console.error("Error in getVerificationSummary:", error);
    throw new CustomError("Failed to fetch verification summary", 500);
  }
};

const getAllManagersWithVerifications = async () => {
  try {
    const managers = await prisma.hrms_d_employee.findMany({
      where: {
        id: {
          in: await prisma.hrms_d_daily_attendance_entry
            .findMany({
              where: { verified_by_manager_id: { not: null } },
              select: { verified_by_manager_id: true },
              distinct: ["verified_by_manager_id"],
            })
            .then((records) => records.map((r) => r.verified_by_manager_id)),
        },
      },
      select: {
        id: true,
        employee_code: true,
        full_name: true,
        hrms_employee_designation: {
          select: { designation_name: true },
        },
        hrms_employee_department: {
          select: { department_name: true },
        },
      },
      orderBy: { full_name: "asc" },
    });

    return managers;
  } catch (error) {
    console.error("Error in getAllManagersWithVerifications:", error);
    throw new CustomError("Failed to fetch managers", 500);
  }
};

module.exports = {
  createDailyAttendance,
  findDailyAttendanceById,
  upsertDailyAttendance,
  deleteDailyAttendance,
  getAllDailyAttendance,
  getAttendanceSummaryByEmployee,
  findAttendanceByEmployeeId,
  getAllHRUsers,
  getManagerTeamAttendance,
  getManagerEmployees,
  bulkVerifyWithManualHR,
  verifyAttendanceWithManualHR,
  getVerificationStatusForHR,
  getVerificationSummary,
  getAllManagersWithVerifications,
};
