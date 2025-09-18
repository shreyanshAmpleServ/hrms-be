const announcementModel = require("../models/announcementModel.js");
const { PrismaClient } = require("@prisma/client");
const cron = require("node-cron");
const { deleteFromBackblaze } = require("../../utils/uploadBackblaze.js");
const prisma = new PrismaClient();

const jobs = {};
const oneTimeJobs = new Map();

const createAnnouncement = async (data) => {
  console.log(` Creating new announcement: ${data.title}`);

  const announcement = await announcementModel.createAnnouncement(data);

  await announcementModel.logAnnouncementAction(
    announcement.id,
    "Created",
    {
      title: data.title,
      target_type: data.target_type,
      has_image: !!data.image_url,
      scheduled: !!data.scheduled_at,
    },
    "Success",
    data.createdby
  );

  if (data.scheduled_at) {
    const scheduledDate = new Date(data.scheduled_at);
    const now = new Date();

    if (scheduledDate > now) {
      await scheduleAnnouncementWithTimeout(announcement.id, scheduledDate);
      console.log(
        ` Announcement ${announcement.id} scheduled for ${scheduledDate}`
      );

      await announcementModel.logAnnouncementAction(
        announcement.id,
        "Scheduled",
        {
          scheduled_for: scheduledDate.toISOString(),
          delay_minutes: Math.round(
            (scheduledDate.getTime() - now.getTime()) / 1000 / 60
          ),
        },
        "Success",
        data.createdby
      );
    } else {
      console.log(` Scheduled time has passed, executing immediately`);
      await processAnnouncementDisplay(announcement.id);
    }
  } else {
    await processAnnouncementDisplay(announcement.id);
  }

  return announcement;
};

const scheduleAnnouncementWithTimeout = (announcementId, scheduledAt) => {
  const now = new Date();
  const delay = scheduledAt.getTime() - now.getTime();

  if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
    console.log(
      ` Using setTimeout for announcement ${announcementId} (${Math.round(
        delay / 1000 / 60
      )} minutes)`
    );

    jobs[announcementId] = {
      type: "timeout",
      scheduledAt: scheduledAt,
      job: setTimeout(async () => {
        try {
          console.log(
            `Timeout executing announcement ${announcementId} at ${new Date().toISOString()}`
          );
          await processAnnouncementDisplay(announcementId);
          delete jobs[announcementId];
        } catch (error) {
          console.error(
            `Timeout execution failed for announcement ${announcementId}:`,
            error
          );
        }
      }, delay),

      stop: function () {
        clearTimeout(this.job);
      },
    };
  } else if (delay > 0) {
    console.log(
      ` Using cron for announcement ${announcementId} (${Math.round(
        delay / 1000 / 60 / 60
      )} hours)`
    );
    scheduleAnnouncementForTime(announcementId, scheduledAt);
  } else {
    console.log(
      ` Executing announcement ${announcementId} immediately (past time)`
    );
    processAnnouncementDisplay(announcementId);
  }
};

const generateCronFromDateTime = (dateTime) => {
  const date = new Date(dateTime);
  const minute = date.getMinutes();
  const hour = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${minute} ${hour} ${day} ${month} *`;
};

const scheduleAnnouncementForTime = async (announcementId, scheduledAt) => {
  if (jobs[announcementId]) {
    jobs[announcementId].stop();
    delete jobs[announcementId];
  }

  const cronExpression = generateCronFromDateTime(scheduledAt);
  console.log(
    ` Creating cron job for announcement ${announcementId}: ${cronExpression}`
  );

  jobs[announcementId] = cron.schedule(
    cronExpression,
    async () => {
      try {
        console.log(
          ` Cron executing announcement ${announcementId} at ${new Date().toISOString()}`
        );
        await processAnnouncementDisplay(announcementId);

        if (jobs[announcementId]) {
          jobs[announcementId].stop();
          delete jobs[announcementId];
        }

        console.log(
          ` Cron job completed and cleaned up for announcement ${announcementId}`
        );
      } catch (error) {
        console.error(
          ` Cron job failed for announcement ${announcementId}:`,
          error
        );
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );

  oneTimeJobs.set(announcementId, {
    scheduledAt: scheduledAt,
    cronExpression: cronExpression,
    created: new Date(),
    type: "cron",
  });
};

const processAnnouncementDisplay = async (announcementId) => {
  try {
    console.log(` Processing display for announcement ${announcementId}`);

    const announcement = await announcementModel.findAnnouncementById(
      announcementId
    );
    if (!announcement) {
      throw new Error(`Announcement ${announcementId} not found`);
    }

    const targetEmployees = await getTargetEmployees(
      announcement.target_type,
      announcement.target_values
    );

    console.log(
      ` Announcement will be displayed to ${targetEmployees.length} employees`
    );

    await announcementModel.logAnnouncementAction(
      announcementId,
      "Displayed",
      {
        total_recipients: targetEmployees.length,
        processed_count: targetEmployees.length,
        has_image: !!announcement.image_url,
        executed_at: new Date().toISOString(),
        target_employees: targetEmployees.slice(0, 5).map((emp) => ({
          id: emp.id,
          name: emp.full_name,
          email: emp.email,
        })),
      },
      "Success"
    );

    console.log(
      `Announcement ${announcementId} is now live for ${targetEmployees.length} employees`
    );
    return {
      displayedToCount: targetEmployees.length,
      totalRecipients: targetEmployees.length,
      employees: targetEmployees,
    };
  } catch (error) {
    console.error(
      ` Error processing display for announcement ${announcementId}:`,
      error
    );

    await announcementModel.logAnnouncementAction(
      announcementId,
      "Displayed",
      {
        error: error.message,
        failed_at: new Date().toISOString(),
      },
      "Failed"
    );

    throw error;
  }
};

const getScheduledJobsStatus = () => {
  const activeJobs = Object.keys(jobs).map((announcementId) => {
    const job = jobs[announcementId];
    const jobInfo = oneTimeJobs.get(parseInt(announcementId));

    return {
      announcementId: parseInt(announcementId),
      scheduledAt: job.scheduledAt || jobInfo?.scheduledAt,
      cronExpression: jobInfo?.cronExpression,
      created: jobInfo?.created,
      type: job.type || jobInfo?.type || "unknown",
    };
  });

  return {
    totalActiveJobs: activeJobs.length,
    jobs: activeJobs,
    serverTime: new Date().toISOString(),
  };
};

const initializeScheduledAnnouncements = async () => {
  try {
    console.log(" Initializing scheduled announcements...");

    const scheduledAnnouncements = await prisma.hrms_d_announcement.findMany({
      where: {
        scheduled_at: {
          gte: new Date(),
        },
        is_active: "Y",
      },
      orderBy: { scheduled_at: "asc" },
    });

    console.log(
      ` Found ${scheduledAnnouncements.length} scheduled announcements to initialize`
    );

    for (const announcement of scheduledAnnouncements) {
      console.log(
        ` Re-scheduling announcement ${announcement.id} for ${announcement.scheduled_at}`
      );
      await scheduleAnnouncementWithTimeout(
        announcement.id,
        new Date(announcement.scheduled_at)
      );
    }

    console.log(" Scheduled announcements initialization completed");
  } catch (error) {
    console.error(" Failed to initialize scheduled announcements:", error);
  }
};

const getEmployeeAnnouncement = async (employeeId) => {
  try {
    console.log(` Getting announcements for employee ID: ${employeeId}`);

    const employee = await prisma.hrms_d_employee.findUnique({
      where: { id: parseInt(employeeId) },
      include: {
        hrms_employee_department: true,
        user_employee: {
          include: {
            hrms_d_user_role: {
              include: {
                hrms_m_role: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      console.warn(` Employee ${employeeId} not found`);
      return [];
    }

    console.log(` Employee Details:`, {
      id: employee.id,
      name: employee.full_name,
      department_id: employee.department_id,
      work_location: employee.work_location,
      roles: employee.user_employee?.[0]?.hrms_d_user_role?.map((ur) => ({
        role_id: ur.role_id,
        role_name: ur.hrms_m_role?.role_name,
      })),
    });

    const announcements = await prisma.hrms_d_announcement.findMany({
      where: { is_active: "Y" },
      orderBy: { updatedate: "desc" },
    });

    console.log(` Found ${announcements.length} total active announcements`);

    const matchingAnnouncements = [];

    for (const announcement of announcements) {
      console.log(
        ` Checking announcement ${announcement.id}: "${announcement.title}"`
      );
      console.log(`   Target Type: ${announcement.target_type}`);
      console.log(`   Target Values: ${announcement.target_values}`);

      const targetEmployees = await getTargetEmployees(
        announcement.target_type,
        JSON.parse(announcement.target_values || "[]")
      );

      console.log(`   Found ${targetEmployees.length} target employees`);

      const isTargeted = targetEmployees.some(
        (emp) => emp.id === parseInt(employeeId)
      );

      console.log(`   Is employee ${employeeId} targeted? ${isTargeted}`);

      if (isTargeted) {
        matchingAnnouncements.push({
          ...announcement,
          target_values: JSON.parse(announcement.target_values || "[]"),
          isForMe: true,
        });
      }
    }

    console.log(
      ` Found ${matchingAnnouncements.length} announcements for employee ${employeeId}`
    );

    return matchingAnnouncements;
  } catch (error) {
    console.error(` Error fetching employee announcement:`, error);
    throw new Error(`Error fetching employee announcement: ${error.message}`);
  }
};

const getEmployeeAnnouncements = async (employeeId, page = 1, size = 10) => {
  try {
    const skip = (page - 1) * size;

    const allAnnouncements = await prisma.hrms_d_announcement.findMany({
      where: {
        is_active: "Y",
      },
      orderBy: { updatedate: "desc" },
    });

    const targetedAnnouncements = [];

    for (const announcement of allAnnouncements) {
      const targetEmployees = await getTargetEmployees(
        announcement.target_type,
        JSON.parse(announcement.target_values || "[]")
      );

      const isTargeted = targetEmployees.some(
        (emp) => emp.id === parseInt(employeeId)
      );

      if (isTargeted) {
        targetedAnnouncements.push({
          ...announcement,
          target_values: JSON.parse(announcement.target_values || "[]"),
        });
      }
    }

    const paginatedAnnouncements = targetedAnnouncements.slice(
      skip,
      skip + size
    );

    return {
      data: paginatedAnnouncements,
      currentPage: page,
      size,
      totalPages: Math.ceil(targetedAnnouncements.length / size),
      totalCount: targetedAnnouncements.length,
    };
  } catch (error) {
    throw new Error(`Error fetching employee announcements: ${error.message}`);
  }
};

const getTargetEmployees = async (targetType, targetValues) => {
  const baseWhere = { status: "Active" };
  const commonInclude = {
    hrms_employee_department: true,
    hrms_employee_designation: true,
    user_employee: {
      include: {
        hrms_d_user_role: {
          include: {
            hrms_m_role: true,
          },
        },
      },
    },
  };

  let parsedTargetValues = [];
  try {
    if (typeof targetValues === "string") {
      parsedTargetValues = JSON.parse(targetValues);
    } else if (Array.isArray(targetValues)) {
      parsedTargetValues = targetValues;
    } else {
      console.warn(
        ` Unexpected targetValues type: ${typeof targetValues}`,
        targetValues
      );
      parsedTargetValues = [];
    }

    if (typeof parsedTargetValues === "string") {
      parsedTargetValues = JSON.parse(parsedTargetValues);
    }

    console.log(parsedTargetValues);
  } catch (error) {
    console.error(
      `Error parsing targetValues:`,
      error,
      "Original:",
      targetValues
    );
    parsedTargetValues = [];
  }

  let employees = [];

  try {
    switch (targetType) {
      case "All":
        employees = await prisma.hrms_d_employee.findMany({
          where: baseWhere,
          include: commonInclude,
        });
        break;

      case "Department":
        if (parsedTargetValues.length === 0) {
          console.warn(
            " No department IDs provided for Department target type"
          );
          break;
        }
        employees = await prisma.hrms_d_employee.findMany({
          where: {
            ...baseWhere,
            department_id: { in: parsedTargetValues.map(Number) },
          },
          include: commonInclude,
        });
        break;

      case "Role":
        if (parsedTargetValues.length === 0) {
          console.warn(" No role IDs provided for Role target type");
          break;
        }
        employees = await prisma.hrms_d_employee.findMany({
          where: {
            ...baseWhere,
            user_employee: {
              some: {
                hrms_d_user_role: {
                  some: {
                    role_id: { in: parsedTargetValues.map(Number) },
                  },
                },
              },
            },
          },
          include: commonInclude,
        });
        break;

      case "Branch":
        if (parsedTargetValues.length === 0) {
          console.warn(" No branch names provided for Branch target type");
          break;
        }
        employees = await prisma.hrms_d_employee.findMany({
          where: {
            ...baseWhere,
            work_location: { in: parsedTargetValues },
          },
          include: commonInclude,
        });
        break;

      case "Employee":
        if (parsedTargetValues.length === 0) {
          console.warn(" No employee IDs provided for Employee target type");
          break;
        }
        employees = await prisma.hrms_d_employee.findMany({
          where: {
            ...baseWhere,
            id: { in: parsedTargetValues.map(Number) },
          },
          include: commonInclude,
        });
        break;

      default:
        throw new Error(`Unknown target type: ${targetType}`);
    }

    console.log(
      ` Found ${employees.length} employees for target type: ${targetType}`
    );
  } catch (error) {
    console.error(` Error getting target employees:`, error);
    return [];
  }

  return employees;
};

const deleteAnnouncement = async (id) => {
  try {
    const announcement = await announcementModel.findAnnouncementById(id);

    if (jobs[id]) {
      jobs[id].stop();
      delete jobs[id];
    }

    await announcementModel.deleteAnnouncement(id);

    if (
      announcement.image_url &&
      announcement.image_url.includes("backblazeb2.com")
    ) {
      try {
        const imagePath = extractBackblazeFilePath(
          announcement.image_url,
          "announcement_images"
        );
        if (imagePath) {
          await deleteFromBackblaze(imagePath);
          console.log(" Deleted announcement image from Backblaze:", imagePath);
        }
      } catch (error) {
        console.warn(" Failed to delete image from Backblaze:", error.message);
      }
    }

    console.log(` Announcement ${id} deleted successfully`);
  } catch (error) {
    console.error(` Error deleting announcement ${id}:`, error);
    throw error;
  }
};

const extractBackblazeFilePath = (url, folderName) => {
  if (!url || !url.includes("backblazeb2.com")) {
    return null;
  }

  try {
    const urlParts = url.split("/");
    const filename = urlParts[urlParts.length - 1];
    return `${folderName}/${filename}`;
  } catch (error) {
    console.error("Error extracting Backblaze file path:", error);
    return null;
  }
};

const getPublicAnnouncements = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    console.log(" Fetching public announcements with filters:", {
      search,
      page,
      size,
    });

    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {
      is_active: "Y",
    };

    if (search) {
      filters.OR = [
        { title: { contains: search.toLowerCase() } },
        { description: { contains: search.toLowerCase() } },
        { priority: { contains: search.toLowerCase() } },
        { target_type: { contains: search.toLowerCase() } },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const announcements = await prisma.hrms_d_announcement.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        image_url: true,
        priority: true,
        target_type: true,
        target_values: true,
        scheduled_at: true,
        is_active: true,
        createdby: true,
        createdate: true,
        updatedate: true,
      },
    });

    const totalCount = await prisma.hrms_d_announcement.count({
      where: filters,
    });

    console.log(` Found ${announcements.length} public announcements`);

    return {
      data: announcements.map((item) => ({
        ...item,
        target_values: JSON.parse(item.target_values || "[]"),
      })),
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.error(" Error fetching public announcements:", error);
    throw new Error("Error retrieving public announcements");
  }
};

const getPublicAnnouncementById = async (id) => {
  try {
    console.log(" Fetching public announcement by ID:", id);

    const announcement = await prisma.hrms_d_announcement.findUnique({
      where: {
        id: parseInt(id),
        is_active: "Y",
      },
      select: {
        id: true,
        title: true,
        description: true,
        image_url: true,
        priority: true,
        target_type: true,
        target_values: true,
        scheduled_at: true,
        is_active: true,
        createdate: true,
        updatedate: true,
      },
    });

    if (!announcement) {
      return null;
    }

    return {
      ...announcement,
      target_values: JSON.parse(announcement.target_values || "[]"),
    };
  } catch (error) {
    console.error(" Error fetching public announcement by ID:", error);
    throw new Error("Error retrieving public announcement");
  }
};

module.exports = {
  createAnnouncement,
  findAnnouncementById: announcementModel.findAnnouncementById,
  updateAnnouncement: announcementModel.updateAnnouncement,
  deleteAnnouncement,
  getAllAnnouncement: announcementModel.getAllAnnouncement,
  processAnnouncementDisplay,
  getEmployeeAnnouncement,
  getEmployeeAnnouncements,
  getScheduledJobsStatus,
  initializeScheduledAnnouncements,
  getPublicAnnouncements,
  getPublicAnnouncementById,
};
