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

    // Get attendance status summary
    const summary = await prisma.hrms_d_daily_attendance_entry.groupBy({
      by: ["employee_id", "status"],
      where: filters,
      _count: { status: true },
    });

    // Get overtime hours summary - assuming you have overtime_hours field in attendance table
    const overtimeSummary = await prisma.hrms_d_daily_attendance_entry.groupBy({
      by: ["employee_id"],
      where: {
        ...filters,
        overtime_hours: {
          gt: 0, // Only include records with overtime hours
        },
      },
      _sum: {
        overtime_hours: true,
      },
      _avg: {
        overtime_hours: true,
      },
      _count: {
        overtime_hours: true,
      },
    });

    // Alternative: If overtime is calculated from check-in/check-out times
    // const overtimeData = await prisma.hrms_d_daily_attendance_entry.findMany({
    //   where: filters,
    //   select: {
    //     employee_id: true,
    //     check_in_time: true,
    //     check_out_time: true,
    //     attendance_date: true,
    //     standard_work_hours: true // assuming you have this field
    //   }
    // });

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
        standard_work_hours_per_day: true, // Add this if you have it
      },
      skip,
      take: size,
    });

    const normalize = (status) => status.toLowerCase().replace(/ /g, "_");

    // Helper function to calculate overtime from check-in/out times (if needed)
    const calculateOvertimeHours = (checkIn, checkOut, standardHours = 8) => {
      if (!checkIn || !checkOut) return 0;

      const checkInTime = new Date(checkIn);
      const checkOutTime = new Date(checkOut);

      // Calculate worked hours
      const workedHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

      // Calculate overtime (worked hours - standard hours)
      const overtime = Math.max(0, workedHours - standardHours);

      return Math.round(overtime * 100) / 100; // Round to 2 decimal places
    };

    const data = employees.map((emp) => {
      const empSummary = summary.filter((s) => s.employee_id === emp.id);
      const empOvertime = overtimeSummary.find((o) => o.employee_id === emp.id);

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
        // Overtime calculations
        total_overtime_hours: empOvertime?._sum?.overtime_hours || 0,
        average_overtime_per_day: empOvertime?._avg?.overtime_hours || 0,
        days_with_overtime: empOvertime?._count?.overtime_hours || 0,
        overtime_hours_formatted: formatHoursToHHMM(
          empOvertime?._sum?.overtime_hours || 0
        ),
      };
    });

    return {
      data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
      // Add summary statistics
      summary: {
        total_employees: totalCount,
        total_overtime_hours: overtimeSummary.reduce(
          (sum, emp) => sum + (emp._sum.overtime_hours || 0),
          0
        ),
        employees_with_overtime: overtimeSummary.length,
      },
    };
  } catch (error) {
    console.error(error);
    throw new CustomError("Error generating attendance summary", 503);
  }
};

// Helper function to format hours to HH:MM format
const formatHoursToHHMM = (hours) => {
  if (!hours) return "00:00";

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  return `${wholeHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

// Alternative implementation if you need to calculate overtime from raw check-in/out data
const getAttendanceSummaryWithCalculatedOvertime = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    // ... (previous code for filters, pagination etc.)

    // Get raw attendance data for overtime calculation
    const attendanceData = await prisma.hrms_d_daily_attendance_entry.findMany({
      where: filters,
      select: {
        employee_id: true,
        check_in_time: true,
        check_out_time: true,
        attendance_date: true,
        status: true,
        hrms_daily_attendance_employee: {
          select: {
            full_name: true,
            employee_code: true,
            standard_work_hours_per_day: true,
          },
        },
      },
    });

    // Calculate overtime for each employee
    const employeeOvertimeMap = {};

    attendanceData.forEach((record) => {
      const { employee_id, check_in_time, check_out_time, status } = record;
      const standardHours =
        record.hrms_daily_attendance_employee?.standard_work_hours_per_day || 8;

      if (!employeeOvertimeMap[employee_id]) {
        employeeOvertimeMap[employee_id] = {
          totalOvertime: 0,
          daysWithOvertime: 0,
          overtimeDetails: [],
        };
      }

      // Only calculate overtime for present/late status
      if (
        ["present", "late"].includes(status.toLowerCase()) &&
        check_in_time &&
        check_out_time
      ) {
        const overtimeHours = calculateOvertimeHours(
          check_in_time,
          check_out_time,
          standardHours
        );

        if (overtimeHours > 0) {
          employeeOvertimeMap[employee_id].totalOvertime += overtimeHours;
          employeeOvertimeMap[employee_id].daysWithOvertime += 1;
          employeeOvertimeMap[employee_id].overtimeDetails.push({
            date: record.attendance_date,
            overtime_hours: overtimeHours,
          });
        }
      }
    });

    // ... (rest of the existing code)

    const data = employees.map((emp) => {
      const empSummary = summary.filter((s) => s.employee_id === emp.id);
      const overtimeData = employeeOvertimeMap[emp.id] || {
        totalOvertime: 0,
        daysWithOvertime: 0,
      };

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
        total_overtime_hours:
          Math.round(overtimeData.totalOvertime * 100) / 100,
        days_with_overtime: overtimeData.daysWithOvertime,
        average_overtime_per_day:
          overtimeData.daysWithOvertime > 0
            ? Math.round(
                (overtimeData.totalOvertime / overtimeData.daysWithOvertime) *
                  100
              ) / 100
            : 0,
        overtime_hours_formatted: formatHoursToHHMM(overtimeData.totalOvertime),
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
    throw new CustomError(
      "Error generating attendance summary with overtime",
      503
    );
  }
};
