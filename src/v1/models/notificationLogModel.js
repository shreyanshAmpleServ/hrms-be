const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize notification log data
const serializeNotificationLog = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  message_title: data.message_title || "",
  message_body: data.message_body || "",
  channel: data.channel || "",
  sent_on: data.sent_on ? new Date(data.sent_on) : null,
  status: data.status || "",
});

// Create a new notification log
const createNotificationLog = async (data, user) => {
  try {
    const created = await prisma.hrms_d_notification_log.create({
      data: {
        ...serializeNotificationLog(data),
        createdby: Number(user.id) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    return await prisma.hrms_d_notification_log.findUnique({
      where: { id: created.id },
      include: {
        notification_log_employee: { select: { id: true, full_name: true } },
      },
    });
  } catch (error) {
    throw new CustomError(
      `Error creating notification log: ${error.message}`,
      500
    );
  }
};

// Find a notification log by ID
const findNotificationLogById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_notification_log.findUnique({
      where: { id: parseInt(id) },
      include: {
        notification_log_employee: { select: { id: true, full_name: true } },
      },
    });
    if (!reqData) {
      throw new CustomError("Notification log not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding notification log by ID: ${error.message}`,
      503
    );
  }
};

// Update a notification log
const updateNotificationLog = async (id, data) => {
  try {
    const updated = await prisma.hrms_d_notification_log.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeNotificationLog(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return await prisma.hrms_d_notification_log.findUnique({
      where: { id: updated.id },
      include: {
        notification_log_employee: { select: { id: true, full_name: true } },
      },
    });
  } catch (error) {
    throw new CustomError(
      `Error updating notification log: ${error.message}`,
      500
    );
  }
};

// Delete a notification log
const deleteNotificationLog = async (id) => {
  try {
    await prisma.hrms_d_notification_log.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting notification log: ${error.message}`,
      500
    );
  }
};

const getAllNotificationLog = async (
  search,
  page,
  size,
  startDate,
  endDate,
  user
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filterConditions = [];

    if (search) {
      filterConditions.push({
        OR: [
          {
            notification_log_employee: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          { message_title: { contains: search.toLowerCase() } },
          { message_body: { contains: search.toLowerCase() } },
          { channel: { contains: search.toLowerCase() } },
          { status: { contains: search.toLowerCase() } },
        ],
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filterConditions.push({
          createdate: {
            gte: start,
            lte: end,
          },
        });
      }
    }

    const filters =
      filterConditions.length > 0 ? { AND: filterConditions } : {};

    const datas = await prisma.hrms_d_notification_log.findMany({
      where: filters,
      skip,
      take: user?.role?.toLowerCase()?.includes("admin")
        ? size
        : user?.role?.toLowerCase()?.includes("hr")
        ? size
        : 0,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        notification_log_employee: { select: { id: true, full_name: true } },
      },
    });

    const totalCount = await prisma.hrms_d_notification_log.count({
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
    throw new CustomError("Error retrieving notification logs", 400);
  }
};

module.exports = {
  createNotificationLog,
  findNotificationLogById,
  updateNotificationLog,
  deleteNotificationLog,
  getAllNotificationLog,
};
