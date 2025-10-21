const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const serializeNotificationSetupData = (data) => ({
  title: data.title || "",
  action_type: data.action_type || "dashboard",
  action_create: data.action_create || false,
  action_update: data.action_update || false,
  action_delete: data.action_delete || false,
  template_id: data.template_id || null,
  is_active: data.is_active || "Y",
  channel_email: data.channel_email || false,
  channel_system: data.channel_system || false,
  channel_whatsapp: data.channel_whatsapp || false,
  channel_sms: data.channel_sms || false,
});
const createNotificationSetup = async (data) => {
  const assignedUsers = data.assigned_users || [];
  try {
    const reqData = await prisma.hrms_d_notification_setup.create({
      data: {
        ...serializeNotificationSetupData(data),
        created_at: new Date(),
      },
    });

    if (assignedUsers.length > 0) {
      await prisma.hrms_d_notification_assigned_user.createMany({
        data: assignedUsers.map((user, index) => ({
          notification_setup_id: reqData.id,
          employee_id: user.employee_id,
          sort_order: user.sort_order || index,
          created_at: new Date(),
        })),
      });
    } else {
      throw new CustomError("Assigned users are required", 400);
    }

    return await findNotificationSetupById(reqData.id);
  } catch (error) {
    throw new CustomError(
      `Error creating notification setup: ${error.message}`,
      500
    );
  }
};

const findNotificationSetupById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_notification_setup.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        template: true,
        hrms_d_notification_assigned: {
          include: {
            assigned_employee: {
              select: {
                id: true,
                employee_code: true,
                full_name: true,
                email: true,
                profile_pic: true,
                hrms_employee_department: {
                  select: {
                    department_name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            sort_order: "asc",
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw error;
  }
};

const updateNotificationSetup = async (id, data) => {
  try {
    const assignedUsers = data.assigned_users || [];

    const updatedEntry = await prisma.hrms_d_notification_setup.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeNotificationSetupData(data),
        updated_at: new Date(),
      },
    });

    if (assignedUsers.length > 0) {
      await prisma.hrms_d_notification_assigned_user.deleteMany({
        where: { notification_setup_id: parseInt(id) },
      });

      await prisma.hrms_d_notification_assigned_user.createMany({
        data: assignedUsers.map((user, index) => ({
          notification_setup_id: parseInt(id),
          employee_id: user.employee_id,
          sort_order: user.sort_order || index,
          created_at: new Date(),
        })),
      });
    }

    return await findNotificationSetupById(id);
  } catch (error) {
    throw new CustomError(
      `Error updating notification setup: ${error.message}`,
      500
    );
  }
};

const deleteNotificationSetup = async (id) => {
  try {
    await prisma.hrms_d_notification_setup.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400
      );
    } else {
      throw new CustomError(error.meta?.constraint || error.message, 500);
    }
  }
};

const getAllNotificationSetup = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};

    if (search) {
      filters.OR = [
        { title: { contains: search.toLowerCase() } },
        { action_type: { contains: search.toLowerCase() } },
      ];
    }

    if (is_active) {
      filters.is_active =
        is_active.toString().trim().toLowerCase() === "true" ||
        is_active.toString().trim().toLowerCase() === "y"
          ? "Y"
          : "N";
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.created_at = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_notification_setup.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updated_at: "desc" }, { created_at: "desc" }],
      include: {
        template: {
          select: { id: true, name: true, key: true },
        },
        hrms_d_notification_assigned: {
          include: {
            assigned_employee: {
              select: {
                id: true,
                employee_code: true,
                full_name: true,
                email: true,
                profile_pic: true,
                hrms_employee_department: {
                  select: {
                    department_name: true,
                  },
                },
              },
            },
          },
          orderBy: { sort_order: "asc" },
        },
      },
    });

    const totalCount = await prisma.hrms_d_notification_setup.count({
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
    throw new CustomError(
      `Error retrieving notification setups: ${error.message}`,
      503
    );
  }
};

module.exports = {
  createNotificationSetup,
  findNotificationSetupById,
  updateNotificationSetup,
  deleteNotificationSetup,
  getAllNotificationSetup,
};
