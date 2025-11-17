const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const getEmployeeDashboardData = async (filterDays) => {
  try {
    const { startDate, endDate } = filterDays;
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);

    if (!startMoment.isValid() || !endMoment.isValid()) {
      throw new Error("Invalid date range provided");
    }
    const deal = await prisma.Deal.findMany({
      where: {
        createdDate: {
          gte: startMoment.toDate(),
          lte: endMoment.toDate(),
        },
      },
      include: {
        deals: true,
        pipeline: true,
      },

      orderBy: [{ updatedDate: "desc" }, { createdDate: "desc" }],
    });
    const deals = await prisma.Deal.findMany({
      where: {
        ...(startMoment &&
          endMoment && {
            createdDate: {
              gte: startMoment.toDate(),
              lte: endMoment.toDate(),
            },
          }),
        ...(filterDays?.dealsPipelineFilter && {
          pipelineId: Number(filterDays?.dealsPipelineFilter),
        }),
      },
      include: {
        deals: true,
        pipeline: true,
      },
      orderBy: [{ updatedDate: "desc" }, { createdDate: "desc" }],
    });
    const dealsss = await prisma.Deal.findMany({
      where: {
        ...(startMoment &&
          endMoment && {
            createdDate: {
              gte: startMoment.toDate(),
              lte: endMoment.toDate(),
            },
          }),
        ...(filterDays?.wonDealFilter && {
          pipelineId: Number(filterDays?.wonDealFilter),
        }),
      },
      include: {
        deals: true,
        pipeline: true,
      },
    });
    const wonDeals = dealsss.filter((deal) => deal.status === "Won");
    const dealssss = await prisma.Deal.findMany({
      where: {
        ...(startMoment &&
          endMoment && {
            createdDate: {
              gte: startMoment.toDate(),
              lte: endMoment.toDate(),
            },
          }),
        ...(filterDays?.lostDealFilter && {
          pipelineId: Number(filterDays?.lostDealFilter),
        }),
      },
      include: {
        deals: true,
        pipeline: true,
      },
    });
    const lostDeals = dealssss.filter((deal) => deal.status === "Lost");

    const dealss = await prisma.Deal.findMany({
      where: filterDays?.monthlyDealFilter && {
        pipelineId: Number(filterDays?.monthlyDealFilter),
      },
    });
    const monthlyDeals = {};
    dealss.forEach((deal) => {
      const month = new Date(deal.dueDate).getMonth() + 1;
      monthlyDeals[month] = (monthlyDeals[month] || 0) + (deal.dealValue || 0);
    });

    const formattedDeals = deals.map((deal) => {
      const { deals, ...rest } = parseTags(deal);
      return { ...rest, stages: deal.deals || [] };
    });

    return {
      deal: deal,
      deals: formattedDeals,
      monthlyDeals: monthlyDeals,
      wonDeals: wonDeals,
      lostDeals: lostDeals,
    };
  } catch (error) {
    console.log("Dashboard getting error : ", error);
    throw new CustomError("Error retrieving dashboard", 503);
  }
};

const getEmployeeLeavesData = async (employeeId) => {
  const [leaveApplications, leaveBalance, leaveEncashments] = await Promise.all(
    [
      prisma.hrms_d_leave_application.findMany({
        where: { employee_id: employeeId },
        include: { leave_types: true },
        orderBy: { start_date: "desc" },
        take: 10,
      }),

      prisma.hrms_d_leave_balance.findFirst({
        where: { employee_id: employeeId },
        include: {
          leave_balance_details_parent: {
            include: {
              leave_balance_details_LeaveType: true,
            },
          },
        },
      }),

      prisma.hrms_d_leave_encashment.findMany({
        where: { employee_id: employeeId },
        include: { encashment_leave_types: true },
        orderBy: { encashment_date: "desc" },
        take: 10,
      }),
    ]
  );

  return {
    leaveApplications,
    leaveBalance,
    leaveEncashments,
  };
};

const getEmployeeAttendanceSummary = async (employeeId) => {
  const today = moment().startOf("day");
  const now = moment();
  const weekStart = moment().startOf("isoWeek");
  const lastWeekStart = moment().subtract(1, "week").startOf("isoWeek");
  const lastWeekEnd = moment().subtract(1, "week").endOf("isoWeek");
  const monthStart = moment().startOf("month");
  const lastMonthStart = moment().subtract(1, "month").startOf("month");
  const lastMonthEnd = moment().subtract(1, "month").endOf("month");

  console.time("attendance-query");

  const allEntries = await prisma.hrms_d_daily_attendance_entry.findMany({
    where: {
      employee_id: employeeId,
      attendance_date: {
        gte: lastMonthStart.toDate(),
        lte: now.toDate(),
      },
    },
  });

  const todayData = allEntries.find((entry) =>
    moment(entry.attendance_date).isSame(today, "day")
  );

  const sumHours = (entries) =>
    entries.reduce((sum, entry) => {
      if (entry.check_in_time && entry.check_out_time) {
        const inTime = moment(entry.check_in_time);
        const outTime = moment(entry.check_out_time);
        const hours = outTime.diff(inTime, "minutes") / 60;
        return sum + hours;
      }
      return sum;
    }, 0);

  const filterByRange = (start, end) =>
    allEntries.filter((entry) =>
      moment(entry.attendance_date).isBetween(start, end, null, "[]")
    );

  const formatPercentage = (worked, target) =>
    target > 0 ? Math.round((worked / target) * 100) : 0;

  const thisWeek = filterByRange(weekStart, now);
  const lastWeek = filterByRange(lastWeekStart, lastWeekEnd);
  const thisMonth = filterByRange(monthStart, now);
  const lastMonth = filterByRange(lastMonthStart, lastMonthEnd);

  const targetWeek = 40;
  const targetMonth = 160;

  console.timeEnd("attendance-query");

  return {
    today: {
      check_in_time: todayData?.check_in_time,
      check_out_time: todayData?.check_out_time,
      working_hours:
        todayData?.check_in_time && todayData?.check_out_time
          ? moment(todayData.check_out_time).diff(
              moment(todayData.check_in_time),
              "minutes"
            ) / 60
          : 0,
    },
    thisWeek: {
      total_hours: sumHours(thisWeek),
      target: targetWeek,
      percentage: formatPercentage(sumHours(thisWeek), targetWeek),
    },
    lastWeek: {
      total_hours: sumHours(lastWeek),
      target: targetWeek,
      percentage: formatPercentage(sumHours(lastWeek), targetWeek),
    },
    thisMonth: {
      total_hours: sumHours(thisMonth),
      target: targetMonth,
      percentage: formatPercentage(sumHours(thisMonth), targetMonth),
    },
    lastMonth: {
      total_hours: sumHours(lastMonth),
      target: targetMonth,
      percentage: formatPercentage(sumHours(lastMonth), targetMonth),
    },
  };
};

const getEmployeeDetails = async (employeeId) => {
  return await prisma.hrms_d_employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      full_name: true,
      employee_code: true,
      phone_number: true,
      date_of_birth: true,
      gender: true,
      email: true,
      join_date: true,
      address: true,
      profile_pic: true,
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
  });
};

const getAllUpcomingBirthdays = async (page = 1, size = 10) => {
  const today = moment();
  const tomorrow = moment().add(1, "day");

  const employees = await prisma.hrms_d_employee.findMany({
    where: {
      date_of_birth: {
        not: null,
      },
    },
    select: {
      id: true,

      first_name: true,
      last_name: true,
      designation_id: true,
      profile_pic: true,
      date_of_birth: true,
      hrms_employee_designation: {
        select: {
          designation_name: true,
        },
      },
    },
  });

  const todayList = [];
  const tomorrowList = [];
  const others = [];

  employees.forEach((emp) => {
    const dob = moment(emp.date_of_birth);
    const currentYear = today.year();
    let birthdayThisYear = moment(
      `${currentYear}-${dob.format("MM-DD")}`,
      "YYYY-MM-DD"
    );

    if (birthdayThisYear.isBefore(today, "day")) {
      birthdayThisYear.add(1, "year");
    }

    const formattedLabel = birthdayThisYear.isSame(today, "day")
      ? "today"
      : birthdayThisYear.isSame(tomorrow, "day")
      ? "tomorrow"
      : birthdayThisYear.format("DD MMM YYYY");

    const birthdayObj = {
      id: emp.id,
      name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
      designation: emp.hrms_employee_designation?.designation_name || "",
      profile_pic: emp.profile_pic || "",
      birthday: birthdayThisYear.toDate(),
      label: formattedLabel,
    };

    if (formattedLabel === "today") {
      todayList.push(birthdayObj);
    } else if (formattedLabel === "tomorrow") {
      tomorrowList.push(birthdayObj);
    } else {
      others.push(birthdayObj);
    }
  });

  const all = [...todayList, ...tomorrowList, ...others].sort(
    (a, b) => a.birthday - b.birthday
  );

  const totalCount = all.length;
  const totalPages = Math.ceil(totalCount / size);
  const offset = (page - 1) * size;

  const paginated = all.slice(offset, offset + size);

  if (paginated.length === 0) {
    return {
      data: {},
      currentPage: page,
      size,
      totalPages,
      totalCount,
    };
  }

  const grouped = {};
  paginated.forEach((item) => {
    const { birthday, label, ...rest } = item;
    if (!grouped[label]) {
      grouped[label] = [];
    }
    grouped[label].push(rest);
  });

  return {
    data: grouped,
    currentPage: page,
    size,
    totalPages,
    totalCount,
  };
};
module.exports = {
  getEmployeeDashboardData,
  getEmployeeLeavesData,
  getEmployeeAttendanceSummary,
  getEmployeeDetails,
  getAllUpcomingBirthdays,
};
