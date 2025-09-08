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
        data: assignedUsers.map((user) => ({
          notification_setup_id: reqData.id,
          employee_id: user.employee_id,
          sort_order: user.sort_order || 0,
        })),
      });
    } else {
      throw new CustomError("Assigned users are required", 400);
    }
    return reqData;
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
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Notification setup not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding notification setup by ID: ${error.message}`,
      503
    );
  }
};

const updateNotificationSetup = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_notification_setup.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeNotificationSetupData(data),
        updated_at: new Date(),
      },
    });
    return updatedEntry;
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
        "This record cannot be deleted because it has associated data other records. Please remove the dependent data first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

const getAllNotificationSetup = async (search, page, size, is_active) => {
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
    const datas = await prisma.hrms_d_notification_setup.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updated_at: "desc" }, { created_at: "desc" }],
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
