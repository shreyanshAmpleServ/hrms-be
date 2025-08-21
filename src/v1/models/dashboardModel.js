const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { id } = require("zod/v4/locales");
const prisma = new PrismaClient();
const { DateTime } = require("luxon");

const parseTags = (deal) => {
  if (deal && deal.tags) {
    deal.tags = JSON.parse(deal.tags);
  }
  return deal;
};

const findDealById = async (id) => {
  try {
    const deal = await prisma.Deal.findUnique({
      where: { id: parseInt(id) },
      include: {
        DealContacts: {
          include: {
            contact: true,
          },
        },
        DealHistory: true,
      },
    });
    return parseTags(deal);
  } catch (error) {
    throw new CustomError("Error finding deal by ID", 503);
  }
};

const getDashboardData = async (filterDays) => {
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

const getAllEmployeeAttendance = async (dateString) => {
  let today;

  if (dateString) {
    today = DateTime.fromISO(dateString, { zone: "Asia/Kolkata" }).startOf(
      "day"
    );
  } else {
    today = DateTime.now().setZone("Asia/Kolkata").startOf("day");
  }

  const endOfDay = today.endOf("day");

  const employees = await prisma.hrms_d_employee.findMany({
    where: { status: { in: ["Active", "Probation"] } },
    select: { id: true },
  });

  const totalEmployees = employees.length;
  const employeeIds = employees.map((e) => e.id);

  // 🟡 Fetch all entries for the day, ordered by latest first
  const attendanceRecords = await prisma.hrms_d_daily_attendance_entry.findMany(
    {
      where: {
        attendance_date: {
          gte: today.toJSDate(),
          lte: endOfDay.toJSDate(),
        },
        employee_id: { in: employeeIds },
      },
      orderBy: {
        check_in_time: "desc", // or "createdate" if that field is more reliable
      },
      select: {
        employee_id: true,
        status: true,
        check_in_time: true,
      },
    }
  );

  const latestRecordMap = new Map();
  for (const record of attendanceRecords) {
    if (!latestRecordMap.has(record.employee_id)) {
      latestRecordMap.set(record.employee_id, record.status?.toLowerCase());
    }
  }

  let present = 0;
  let wfh = 0;
  const markedEmployees = new Set();

  for (const [empId, status] of latestRecordMap.entries()) {
    markedEmployees.add(empId);
    console.log("status : ", status);
    if (status === "present") present++;
    else if (status === "work from home" || status === "wfh") {
      console.log("wfh");
      wfh++;
    }
  }

  const absent = totalEmployees - markedEmployees.size;

  const presentPercentage =
    totalEmployees === 0
      ? "0.00%"
      : ((present / totalEmployees) * 100).toFixed(2) + "%";

  return {
    date: today.toISODate(),
    total_employees: totalEmployees,
    present,
    work_from_home: wfh,
    absent,
    present_percentage: presentPercentage,
  };
};

const getUpcomingBirthdays = async (page = 1, size = 10) => {
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

const getAllUpcomingBirthdays = async () => {
  const today = moment().startOf("day");
  const oneYearLater = moment(today).add(1, "year").endOf("day");

  const employees = await prisma.hrms_d_employee.findMany({
    where: {
      date_of_birth: {
        not: null,
      },
    },
    select: {
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

  const allBirthdays = employees.map((emp) => {
    const dob = moment(emp.date_of_birth);
    const currentYear = today.year();
    let nextBirthday = moment(
      `${currentYear}-${dob.format("MM-DD")}`,
      "YYYY-MM-DD"
    );
    if (nextBirthday.isBefore(today, "day")) {
      nextBirthday.add(1, "year");
    }

    return {
      name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
      designation: emp.hrms_employee_designation?.designation_name || "",
      profile_pic: emp.profile_pic || "",
      birthday: nextBirthday.format("YYYY-MM-DD"),
    };
  });

  return allBirthdays
    .filter(
      ({ birthday }) =>
        moment(birthday).isSameOrAfter(today, "day") &&
        moment(birthday).isSameOrBefore(oneYearLater, "day")
    )
    .sort((a, b) => moment(a.birthday) - moment(b.birthday));
};

const getDesignations = async () => {
  const employees = await prisma.hrms_d_employee.findMany({
    where: {
      designation_id: { not: null },
    },
    select: {
      designation_id: true,
      join_date: true,
      hrms_employee_designation: {
        select: {
          designation_name: true,
        },
      },
    },
  });

  const designationMap = {};
  let total_growth_last_week = 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  for (const emp of employees) {
    const designation =
      emp.hrms_employee_designation?.designation_name || "Unknown";

    designationMap[designation] = (designationMap[designation] || 0) + 1;

    if (emp.join_date && new Date(emp.join_date) >= oneWeekAgo) {
      total_growth_last_week += 1;
    }
  }

  const total_employees = employees.length;
  const percentage_growth = total_employees
    ? ((total_growth_last_week / total_employees) * 100).toFixed(2) + "%"
    : "0.00%";

  const labels = Object.keys(designationMap);
  const values = Object.values(designationMap);

  return {
    total_growth_last_week: percentage_growth,
    labels,
    values,
  };
};

const getDepartment = async () => {
  const departments = await prisma.hrms_d_employee.groupBy({
    by: ["department_id"],
    where: {
      department_id: { not: null },
    },
    _count: {
      _all: true,
    },
  });

  const departmentIds = departments.map((d) => d.department_id);
  const departmentDetails = await prisma.hrms_m_department_master.findMany({
    where: {
      id: { in: departmentIds },
    },
    select: {
      id: true,
      department_name: true,
    },
  });

  const deptNameMap = {};
  for (const dept of departmentDetails) {
    deptNameMap[dept.id] = dept.department_name || "Unknown";
  }

  const labels = [];
  const values = [];

  for (const dept of departments) {
    labels.push(deptNameMap[dept.department_id] || "Unknown");
    values.push(dept._count._all);
  }

  return {
    labels,
    values,
  };
};

const getStatus = async () => {
  const statusData = await prisma.hrms_d_employee.groupBy({
    by: ["status"],
    _count: {
      _all: true,
    },
    where: {
      status: {
        not: null,
      },
    },
  });

  const statusOrder = [
    "Active",
    "Probation",
    "On Hold",
    "Resigned",
    "Notice Period",
    "Terminated",
    "Absconded",
    "Retired",
  ];

  const statusCountMap = {};
  for (const item of statusData) {
    const key = item.status?.trim() || "Unknown";
    statusCountMap[key] = item._count._all;
  }

  const labels = [];
  const values = [];

  for (const status of statusOrder) {
    labels.push(status);
    values.push(statusCountMap[status] || 0);
  }

  return {
    data: {
      labels,
      values,
    },
  };
};

// const workAnniversary = async (page = 1, size = 10) => {
//   const today = moment();
//   const tomorrow = moment().add(1, "day");

//   const employees = await prisma.hrms_d_employee.findMany({
//     where: {
//       join_date: {
//         not: null,
//       },
//     },
//     select: {
//       id: true,
//       first_name: true,
//       last_name: true,
//       designation_id: true,
//       profile_pic: true,
//       join_date: true,
//       hrms_employee_designation: {
//         select: {
//           designation_name: true,
//         },
//       },
//     },
//   });

//   const todayList = [];
//   const tomorrowList = [];
//   const others = [];

//   employees.forEach((emp) => {
//     const joinDate = moment(emp.join_date);
//     const currentYear = today.year();
//     let anniversaryThisYear = moment(
//       `${currentYear}-${joinDate.format("MM-DD")}`,
//       "YYYY-MM-DD"
//     );

//     if (anniversaryThisYear.isBefore(today, "day")) {
//       anniversaryThisYear.add(1, "year");
//     }

//     const yearsOfService = anniversaryThisYear.year() - joinDate.year();

//     const formattedLabel = anniversaryThisYear.isSame(today, "day")
//       ? "today"
//       : anniversaryThisYear.isSame(tomorrow, "day")
//       ? "tomorrow"
//       : anniversaryThisYear.format("DD MMM YYYY");

//     const anniversaryObj = {
//       id: emp.id,
//       name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
//       designation: emp.hrms_employee_designation?.designation_name || "",
//       profile_pic: emp.profile_pic || "",
//       anniversary: anniversaryThisYear.toDate(),
//       years_of_service: yearsOfService,
//       label: formattedLabel,
//     };

//     if (formattedLabel === "today") {
//       todayList.push(anniversaryObj);
//     } else if (formattedLabel === "tomorrow") {
//       tomorrowList.push(anniversaryObj);
//     } else {
//       others.push(anniversaryObj);
//     }
//   });

//   const all = [...todayList, ...tomorrowList, ...others].sort(
//     (a, b) => b.anniversary - a.anniversary
//   );

//   const totalCount = all.length;
//   const totalPages = Math.ceil(totalCount / size);
//   const offset = (page - 1) * size;

//   const paginated = all.slice(offset, offset + size);

//   if (paginated.length === 0) {
//     return {
//       data: [],
//       currentPage: page,
//       size,
//       totalPages,
//       totalCount,
//     };
//   }

//   const grouped = {};
//   paginated.forEach((item) => {
//     const { anniversary, label, ...rest } = item;
//     if (!grouped[label]) {
//       grouped[label] = [];
//     }
//     grouped[label].push(rest);
//   });

//   return {
//     data: grouped,
//     currentPage: page,
//     size,
//     totalPages,
//     totalCount,
//   };
// };

const workAnniversary = async (page = 1, size = 10) => {
  const today = moment();
  const next30Days = moment().add(30, "days");

  const employees = await prisma.hrms_d_employee.findMany({
    where: {
      join_date: {
        not: null,
      },
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      designation_id: true,
      profile_pic: true,
      join_date: true,
      hrms_employee_designation: {
        select: {
          designation_name: true,
        },
      },
    },
  });

  const resultList = [];

  employees.forEach((emp) => {
    const joinDate = moment(emp.join_date);
    const currentYear = today.year();

    // anniversary date in current year
    let anniversaryThisYear = moment(
      `${currentYear}-${joinDate.format("MM-DD")}`,
      "YYYY-MM-DD"
    );

    // if already passed this year, shift to next year
    if (anniversaryThisYear.isBefore(today, "day")) {
      anniversaryThisYear.add(1, "year");
    }

    // only include if within next 30 days
    if (
      anniversaryThisYear.isSameOrAfter(today, "day") &&
      anniversaryThisYear.isSameOrBefore(next30Days, "day")
    ) {
      const yearsOfService = anniversaryThisYear.year() - joinDate.year();

      const formattedLabel = anniversaryThisYear.isSame(today, "day")
        ? "today"
        : anniversaryThisYear.isSame(moment().add(1, "day"), "day")
        ? "tomorrow"
        : anniversaryThisYear.format("DD MMM YYYY");

      resultList.push({
        id: emp.id,
        name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
        designation: emp.hrms_employee_designation?.designation_name || "",
        profile_pic: emp.profile_pic || "",
        anniversary: anniversaryThisYear.toDate(),
        years_of_service: yearsOfService,
        label: formattedLabel,
      });
    }
  });

  // sort by upcoming date
  const all = resultList.sort((a, b) => a.anniversary - b.anniversary);

  const totalCount = all.length;
  const totalPages = Math.ceil(totalCount / size);
  const offset = (page - 1) * size;

  const paginated = all.slice(offset, offset + size);

  const grouped = {};
  paginated.forEach((item) => {
    const { anniversary, label, ...rest } = item;
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

const attendanceOverview = async (dateString) => {
  try {
    let today;

    if (dateString) {
      today = DateTime.fromISO(dateString, { zone: "Asia/Kolkata" }).startOf(
        "day"
      );
    } else {
      today = DateTime.now().setZone("Asia/Kolkata").startOf("day");
    }

    const endOfDay = today.endOf("day");

    const employees = await prisma.hrms_d_employee.findMany({
      where: { status: { in: ["Active", "Probation"] } },
      select: { id: true },
    });

    const totalEmployees = employees.length;
    const employeeIds = employees.map((e) => e.id);

    const attendanceRecords =
      await prisma.hrms_d_daily_attendance_entry.findMany({
        where: {
          attendance_date: {
            gte: today.toJSDate(),
            lte: endOfDay.toJSDate(),
          },
          employee_id: { in: employeeIds },
        },
        orderBy: {
          check_in_time: "desc",
        },
        select: {
          employee_id: true,
          status: true,
        },
      });

    const latestRecordMap = new Map();
    for (const record of attendanceRecords) {
      if (!latestRecordMap.has(record.employee_id)) {
        latestRecordMap.set(record.employee_id, record.status);
      }
    }

    const statusCounts = {
      Present: 0,
      Absent: 0,
      Late: 0,
      "Half Day": 0,
      "Work From Home": 0,
    };

    const markedEmployees = new Set();
    // old code
    // for (const [empId, status] of latestRecordMap.entries()) {
    //   markedEmployees.add(empId);
    //   const normalizedStatus = status?.toLowerCase();

    //   if (normalizedStatus === "present") {
    //     statusCounts.Present++;
    //   } else if (normalizedStatus === "late") {
    //     statusCounts.Late++;
    //   } else if (
    //     normalizedStatus === "half day" ||
    //     normalizedStatus === "halfday"
    //   ) {
    //     statusCounts["Half Day"]++;
    //   }
    // }

    // new code by devShivang
    for (const [empId, status] of latestRecordMap.entries()) {
      const normalizedStatus = status?.toLowerCase();

      if (normalizedStatus === "present") {
        statusCounts.Present++;
        markedEmployees.add(empId);
      } else if (normalizedStatus === "late") {
        statusCounts.Late++;
        markedEmployees.add(empId);
      } else if (
        normalizedStatus === "half day" ||
        normalizedStatus === "halfday"
      ) {
        statusCounts["Half Day"]++;
        markedEmployees.add(empId);
      } else if (
        normalizedStatus === "work from home" ||
        normalizedStatus === "wfh"
      ) {
        statusCounts["Work From Home"]++;
        markedEmployees.add(empId);
      }
    }

    statusCounts.Absent = totalEmployees - markedEmployees.size;

    const labels = ["Present", "Absent", "Late", "Half Day", "Work From Home"];
    const values = labels.map((label) => statusCounts[label]);

    return {
      labels,
      values,
    };
  } catch (error) {
    console.log("Error getting attendance status count:", error);
    throw new CustomError("Error retrieving attendance status count", 503);
  }
};
const getEmployeeActivity = async () => {
  try {
    const logs = await prisma.hrms_d_activity_log.findMany({
      orderBy: { created_at: "desc" },
      take: 10,
      include: {
        activity_employee: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
          },
        },
      },
    });

    return logs;
  } catch (error) {
    console.log("Error getting activities:", error);
  }
};
module.exports = {
  findDealById,
  getDashboardData,
  getAllEmployeeAttendance,
  getUpcomingBirthdays,
  getAllUpcomingBirthdays,
  getDesignations,
  getDepartment,
  getStatus,
  workAnniversary,
  attendanceOverview,
  getEmployeeActivity,
};
