const notificationSetupService = require("../services/notificationSetupService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { generateEmailContent } = require("../../utils/emailTemplates");
const sendEmail = require("../../utils/mailer");
const { templateKeyMap } = require("../../utils/templateKeyMap");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// const createNotificationSetup = async (req, res, next) => {
//   try {
//     const {
//       title,
//       action_type,
//       status,
//       notification_triggers,
//       assigned_users,
//       template_id,
//     } = req.body;

//     if (
//       !title ||
//       !action_type ||
//       !assigned_users ||
//       assigned_users.length === 0
//     ) {
//       throw new CustomError(
//         "Title, action type, and at least one assigned user are required",
//         400
//       );
//     }

//     if (
//       !notification_triggers ||
//       (!notification_triggers.onCreate &&
//         !notification_triggers.onUpdate &&
//         !notification_triggers.onDelete)
//     ) {
//       throw new CustomError(
//         "At least one notification trigger must be selected",
//         400
//       );
//     }

//     const data = {
//       title: title.trim(),
//       action_type: action_type,
//       action_create: notification_triggers.onCreate || false,
//       action_update: notification_triggers.onUpdate || false,
//       action_delete: notification_triggers.onDelete || false,
//       template_id: template_id || null,
//       is_active: status === "Active" ? "Y" : "N",
//       assigned_users: assigned_users.map((userId) => ({ employee_id: userId })),
//     };

//     const result = await notificationSetupService.createNotificationSetup(data);

//     await sendNotificationSetupEmails({
//       notificationSetup: result,
//       action: "created",
//       assigned_users,
//       template_id,
//     });

//     res.status(201).success("Notification setup created successfully", result);
//   } catch (error) {
//     next(error);
//   }
// };

const createNotificationSetup = async (req, res, next) => {
  try {
    const {
      title,
      action_type,
      status,
      notification_triggers,
      assigned_users,
      template_id,
      channels,
    } = req.body;

    const existingSetup = await prisma.hrms_d_notification_setup.findFirst({
      where: {
        action_type: action_type,
        is_active: "Y",
      },
    });

    if (existingSetup) {
      return res
        .status(400)
        .error(
          `Notification setup with title "${title}" for action type "${action_type}" already exists`
        );
    }
    if (!channels || (!channels.email && !channels.system)) {
      return res.status(400).send({
        success: false,
        message:
          "At least one notification channel (email or system) must be selected",
      });
    }
    const data = {
      title: title?.trim(),
      action_type: action_type,
      action_create: notification_triggers?.create || false,
      action_update: notification_triggers?.update || false,
      action_delete: notification_triggers?.delete || false,
      template_id: template_id,
      is_active: status === "Active" ? "Y" : "N",
      channel_email: channels?.email || false,
      channel_system: channels?.system || false,
      channel_whatsapp: channels?.whatsapp || false,
      channel_sms: channels?.sms || false,
      assigned_users: assigned_users
        ? assigned_users.map((userId) => ({ employee_id: userId }))
        : [],
    };

    const result = await notificationSetupService.createNotificationSetup(data);

    res.status(201).success("Notification setup created successfully", result);
  } catch (error) {
    next(error);
  }
};

const sendNotificationSetupEmails = async ({
  notificationSetup,
  action,
  assigned_users,
  template_id,
}) => {
  try {
    const company = await prisma.hrms_d_default_configurations.findFirst({
      select: { company_name: true },
    });
    const company_name = company?.company_name || "HRMS System";

    const users = await prisma.hrms_d_employee.findMany({
      where: {
        id: { in: assigned_users },
        email: { not: null },
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        hrms_employee_department: {
          select: { department_name: true },
        },
      },
    });

    for (const user of users) {
      if (user.email) {
        const template = await generateEmailContent(
          template_id || templateKeyMap.notificationSetup,
          {
            employee_name: user.full_name,
            notification_title: notificationSetup.title,
            action_type: formatActionType(notificationSetup.action_type),
            action: action,
            company_name,
            triggers: getActiveTriggers(notificationSetup),
            department_name: user.hrms_employee_department?.department_name,
            setup_date: new Date().toLocaleDateString(),
          }
        );
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.body,
        });

        console.log(`[Notification Setup Email Sent] → ${user.email}`);
      }
    }
  } catch (error) {
    console.error("Error sending notification setup emails:", error);
  }
};

const formatActionType = (type) => {
  const actionTypeMap = {
    leave: "Leave Request",
    asset: "Asset Management",
    employee: "Employee Management",
    attendance: "Attendance",
    payroll: "Payroll",
  };
  return actionTypeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

const getActiveTriggers = (notificationSetup) => {
  const triggers = [];
  if (notificationSetup.action_create) triggers.push("Create");
  if (notificationSetup.action_update) triggers.push("Update");
  if (notificationSetup.action_delete) triggers.push("Delete");
  return triggers.join(", ");
};

// const findNotificationSetupById = async (req, res, next) => {
//   try {
//     const data = await notificationSetupService.findNotificationSetupById(
//       req.params.id
//     );
//     if (!data) throw new CustomError("Notification setup not found", 404);

//     res.status(200).success(null, data);
//   } catch (error) {
//     next(error);
//   }
// };

const findNotificationSetupById = async (req, res, next) => {
  try {
    const reqData = await notificationSetupService.findNotificationSetupById(
      req.params.id
    );
    res
      .status(200)
      .success("Notification setup retrieved successfully", reqData);
  } catch (error) {
    next(error);
  }
};

// const updateNotificationSetup = async (req, res, next) => {
//   try {
//     let reqData = { ...req.body };

//     const data = await notificationSetupService.updateNotificationSetup(
//       req.params.id,
//       reqData
//     );
//     res.status(200).success("Notification setup updated successfully", data);
//   } catch (error) {
//     next(error);
//   }
// };

const updateNotificationSetup = async (req, res, next) => {
  try {
    const {
      title,
      action_type,
      status,
      notification_triggers,
      assigned_users,
      template_id,
      channels,
    } = req.body;

    const data = {
      title: title?.trim(),
      action_type: action_type,
      action_create: notification_triggers?.create || false,
      action_update: notification_triggers?.update || false,
      action_delete: notification_triggers?.delete || false,
      template_id: template_id,
      is_active: status === "Active" ? "Y" : "N",
      channel_email: channels?.email || false,
      channel_system: channels?.system || false,
      channel_whatsapp: channels?.whatsapp || false,
      channel_sms: channels?.sms || false,
      assigned_users: assigned_users
        ? assigned_users.map((userId) => ({ employee_id: userId }))
        : [],
    };

    const result = await notificationSetupService.updateNotificationSetup(
      req.params.id,
      data
    );

    res.status(200).success("Notification setup updated successfully", result);
  } catch (error) {
    next(error);
  }
};

// const deleteNotificationSetup = async (req, res, next) => {
//   try {
//     await notificationSetupService.deleteNotificationSetup(req.params.id);
//     res.status(200).success("Notification setup deleted successfully", null);
//   } catch (error) {
//     next(error);
//   }
// };

// const getAllNotificationSetup = async (req, res, next) => {
//   try {
//     const { page, size, search, startDate, endDate, is_active } = req.query;
//     const data = await notificationSetupService.getAllNotificationSetup(
//       Number(page),
//       Number(size),
//       search,
//       moment(startDate),
//       moment(endDate),
//       is_active
//     );
//     res.status(200).success(null, data);
//   } catch (error) {
//     next(error);
//   }
// };

const deleteNotificationSetup = async (req, res, next) => {
  try {
    const existingSetup =
      await notificationSetupService.findNotificationSetupById(req.params.id);

    if (!existingSetup) {
      throw new CustomError("Notification setup not found", 404);
    }

    const assignedUsers = existingSetup.assigned_users || [];
    const userIds = assignedUsers.map((user) => user.employee_id);

    await notificationSetupService.deleteNotificationSetup(req.params.id);

    if (userIds.length > 0) {
      await sendNotificationSetupEmails({
        notificationSetup: existingSetup,
        action: "deleted",
        assigned_users: userIds,
        template_id: templateKeyMap.notificationSetupDeleted,
      });
    }

    res.status(200).success("Notification setup deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllNotificationSetup = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const data = await notificationSetupService.getAllNotificationSetup(
      Number(page),
      Number(size),
      search,
      startDate,
      endDate,
      is_active
    );
    res.status(200).success("Notification setups retrieved successfully", data);
  } catch (error) {
    next(error);
  }
};
const getAvailableUsers = async (req, res, next) => {
  try {
    const users = await prisma.hrms_d_employee.findMany({
      select: {
        id: true,
        employee_code: true,
        full_name: true,
        department_id: true,
        designation_id: true,
        email: true,
        hrms_employee_department: {
          select: {
            department_name: true,
          },
        },
        hrms_employee_designation: {
          select: {
            designation_name: true,
          },
        },
      },
      orderBy: [{ department_id: "asc" }, { full_name: "asc" }],
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.full_name,
      code: user.employee_code,
      department: user.hrms_employee_department?.department_name || "General",
      designation: user.hrms_employee_designation?.designation_name || "N/A",
      email: user.email,
      initial: user.full_name.charAt(0).toUpperCase(),
    }));

    res
      .status(200)
      .success("Available users retrieved successfully", formattedUsers);
  } catch (error) {
    next(error);
  }
};

const getActionTypes = async (req, res, next) => {
  try {
    const actionTypes = [
      { value: "leave", label: "Leave Request" },
      { value: "asset", label: "Asset Management" },
      { value: "employee", label: "Employee Management" },
      { value: "attendance", label: "Attendance" },
      { value: "payroll", label: "Payroll" },
    ];
    res.status(200).success("Action types retrieved successfully", actionTypes);
  } catch (error) {
    next(error);
  }
};

const getNotificationChannels = async (req, res, next) => {
  try {
    const channels = [
      { value: "email", label: "Email", enabled: true },
      { value: "system", label: "System Notification", enabled: true },
      { value: "whatsapp", label: "WhatsApp", enabled: false }, // Future implementation
      { value: "sms", label: "SMS", enabled: false }, // Future implementation
    ];
    res
      .status(200)
      .success("Notification channels retrieved successfully", channels);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createNotificationSetup,
  findNotificationSetupById,
  getAllNotificationSetup,
  updateNotificationSetup,
  deleteNotificationSetup,
  getAvailableUsers,
  getActionTypes,
  getNotificationChannels,
};
