const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const prisma = new PrismaClient();

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
  const leaveApplications = await prisma.hrms_d_leave_application.findMany({
    where: {
      employee_id: employeeId,
    },
    include: {
      leave_types: true,
    },
    orderBy: {
      start_date: "desc",
    },
  });

  const leaveBalance = await prisma.hrms_d_leave_balance.findFirst({
    where: {
      employee_id: employeeId,
    },
    include: {
      leave_balance_details_parent: {
        include: {
          leave_balance_details_LeaveType: true,
        },
      },
    },
  });

  const leaveEncashments = await prisma.hrms_d_leave_encashment.findMany({
    where: {
      employee_id: employeeId,
    },
    include: {
      encashment_leave_types: true,
    },
    orderBy: {
      encashment_date: "desc",
    },
  });

  return {
    leaveApplications,
    leaveBalance,
    leaveEncashments,
  };
};

// const getEmployeeAttendanceSummary = async (employeeId) => {
//   const today = moment().startOf("day");
//   const weekStart = moment().startOf("isoWeek");
//   const lastWeekStart = moment().subtract(1, "week").startOf("isoWeek");
//   const lastWeekEnd = moment().subtract(1, "week").endOf("isoWeek");
//   const monthStart = moment().startOf("month");
//   const lastMonthStart = moment().subtract(1, "month").startOf("month");
//   const lastMonthEnd = moment().subtract(1, "month").endOf("month");

//   const [todayData, weekData, lastWeekData, monthData, lastMonthData] =
//     await Promise.all([
//       prisma.hrms_d_daily_attendance_entry.findFirst({
//         where: {
//           employee_id: employeeId,
//           attendance_date: {
//             gte: today.toDate(),
//             lt: moment(today).add(1, "day").toDate(),
//           },
//         },
//         orderBy: { attendance_date: "desc" },
//       }),
//       prisma.hrms_d_daily_attendance_entry.findMany({
//         where: {
//           employee_id: employeeId,
//           attendance_date: {
//             gte: weekStart.toDate(),
//             lte: moment().toDate(),
//           },
//         },
//       }),
//       prisma.hrms_d_daily_attendance_entry.findMany({
//         where: {
//           employee_id: employeeId,
//           attendance_date: {
//             gte: lastWeekStart.toDate(),
//             lte: lastWeekEnd.toDate(),
//           },
//         },
//       }),
//       prisma.hrms_d_daily_attendance_entry.findMany({
//         where: {
//           employee_id: employeeId,
//           attendance_date: {
//             gte: monthStart.toDate(),
//             lte: moment().toDate(),
//           },
//         },
//       }),
//       prisma.hrms_d_daily_attendance_entry.findMany({
//         where: {
//           employee_id: employeeId,
//           attendance_date: {
//             gte: lastMonthStart.toDate(),
//             lte: lastMonthEnd.toDate(),
//           },
//         },
//       }),
//     ]);

//   const sumHours = (entries) =>
//     entries.reduce(
//       (sum, a) => sum + (a.working_hours ? Number(a.working_hours) : 0),
//       0
//     );

//   return {
//     today: {
//       check_in_time: todayData?.check_in_time,
//       check_out_time: todayData?.check_out_time,
//       working_hours: Number(todayData?.working_hours || 0),
//     },
//     thisWeek: {
//       total_hours: sumHours(weekData),
//       target: 40,
//     },
//     lastWeek: {
//       total_hours: sumHours(lastWeekData),
//       target: 40,
//     },
//     thisMonth: {
//       total_hours: sumHours(monthData),
//       target: 160,
//     },
//     lastMonth: {
//       total_hours: sumHours(lastMonthData),
//       target: 160,
//     },
//   };
// };

const getEmployeeAttendanceSummary = async (employeeId) => {
  const today = moment().startOf("day");
  const weekStart = moment().startOf("isoWeek");
  const lastWeekStart = moment().subtract(1, "week").startOf("isoWeek");
  const lastWeekEnd = moment().subtract(1, "week").endOf("isoWeek");
  const monthStart = moment().startOf("month");
  const lastMonthStart = moment().subtract(1, "month").startOf("month");
  const lastMonthEnd = moment().subtract(1, "month").endOf("month");

  const [todayData, weekData, lastWeekData, monthData, lastMonthData] =
    await Promise.all([
      prisma.hrms_d_daily_attendance_entry.findFirst({
        where: {
          employee_id: employeeId,
          attendance_date: {
            gte: today.toDate(),
            lt: moment(today).add(1, "day").toDate(),
          },
        },
        orderBy: { attendance_date: "desc" },
      }),
      prisma.hrms_d_daily_attendance_entry.findMany({
        where: {
          employee_id: employeeId,
          attendance_date: {
            gte: weekStart.toDate(),
            lte: moment().toDate(),
          },
        },
      }),
      prisma.hrms_d_daily_attendance_entry.findMany({
        where: {
          employee_id: employeeId,
          attendance_date: {
            gte: lastWeekStart.toDate(),
            lte: lastWeekEnd.toDate(),
          },
        },
      }),
      prisma.hrms_d_daily_attendance_entry.findMany({
        where: {
          employee_id: employeeId,
          attendance_date: {
            gte: monthStart.toDate(),
            lte: moment().toDate(),
          },
        },
      }),
      prisma.hrms_d_daily_attendance_entry.findMany({
        where: {
          employee_id: employeeId,
          attendance_date: {
            gte: lastMonthStart.toDate(),
            lte: lastMonthEnd.toDate(),
          },
        },
      }),
    ]);

  const sumHours = (entries) =>
    entries.reduce(
      (sum, a) => sum + (a.working_hours ? Number(a.working_hours) : 0),
      0
    );

  const formatPercentage = (worked, target) =>
    target > 0 ? Math.round((worked / target) * 100) : 0;

  const targetWeek = 40; // hrs
  const targetMonth = 160; // hrs

  const thisWeekHours = sumHours(weekData);
  const lastWeekHours = sumHours(lastWeekData);
  const thisMonthHours = sumHours(monthData);
  const lastMonthHours = sumHours(lastMonthData);

  return {
    today: {
      check_in_time: todayData?.check_in_time,
      check_out_time: todayData?.check_out_time,
      working_hours: Number(todayData?.working_hours || 0),
    },
    thisWeek: {
      total_hours: thisWeekHours,
      target: targetWeek,
      percentage: formatPercentage(thisWeekHours, targetWeek),
    },
    lastWeek: {
      total_hours: lastWeekHours,
      target: targetWeek,
      percentage: formatPercentage(lastWeekHours, targetWeek),
    },
    thisMonth: {
      total_hours: thisMonthHours,
      target: targetMonth,
      percentage: formatPercentage(thisMonthHours, targetMonth),
    },
    lastMonth: {
      total_hours: lastMonthHours,
      target: targetMonth,
      percentage: formatPercentage(lastMonthHours, targetMonth),
    },
  };
};

module.exports = {
  getEmployeeDashboardData,
  getEmployeeLeavesData,
  getEmployeeAttendanceSummary,
};
