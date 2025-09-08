// controllers/notificationSetupController.js
const notificationSetupService = require("../services/notificationSetupService");
const CustomError = require("../../utils/CustomError");

const getAvailableUsers = async (req, res, next) => {
  try {
    const users = await prisma.hrms_d_employee.findMany({
      select: {
        id: true,
        employee_code: true,
        full_name: true,
        department: true,
        designation: true,
        email: true,
      },
      where: {
        is_active: "Y",
      },
      orderBy: [{ department: "asc" }, { full_name: "asc" }],
    });

    // Format for your UI
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.full_name,
      code: user.employee_code,
      department: user.department || "General",
      designation: user.designation,
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

const createNotificationSetup = async (req, res, next) => {
  try {
    const {
      title,
      action_type,
      status,
      notification_triggers,
      assigned_users,
      template_id,
    } = req.body;

    // Validate inputs
    if (
      !title ||
      !action_type ||
      !assigned_users ||
      assigned_users.length === 0
    ) {
      throw new CustomError(
        "Title, action type, and at least one assigned user are required",
        400
      );
    }

    if (
      !notification_triggers ||
      (!notification_triggers.onCreate &&
        !notification_triggers.onUpdate &&
        !notification_triggers.onDelete)
    ) {
      throw new CustomError(
        "At least one notification trigger must be selected",
        400
      );
    }

    const data = {
      title: title.trim(),
      action_type: action_type,
      action_create: notification_triggers.onCreate || false,
      action_update: notification_triggers.onUpdate || false,
      action_delete: notification_triggers.onDelete || false,
      template_id: template_id || null,
      is_active: status === "Active" ? "Y" : "N",
      assigned_users: assigned_users.map((userId) => ({ employee_id: userId })),
    };

    const result = await notificationSetupService.createNotificationSetup(data);
    res.status(201).success("Notification setup created successfully", result);
  } catch (error) {
    next(error);
  }
};

const getAllNotificationSetups = async (req, res, next) => {
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

const findNotificationSetup = async (req, res, next) => {
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

const updateNotificationSetup = async (req, res, next) => {
  try {
    const {
      title,
      action_type,
      status,
      notification_triggers,
      assigned_users,
      template_id,
    } = req.body;

    const data = {
      title: title?.trim(),
      action_type: action_type,
      action_create: notification_triggers?.onCreate || false,
      action_update: notification_triggers?.onUpdate || false,
      action_delete: notification_triggers?.onDelete || false,
      template_id: template_id,
      is_active: status === "Active" ? "Y" : "N",
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

const deleteNotificationSetup = async (req, res, next) => {
  try {
    await notificationSetupService.deleteNotificationSetup(req.params.id);
    res.status(200).success("Notification setup deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotificationSetup,
  findNotificationSetup,
  getAllNotificationSetups,
  updateNotificationSetup,
  deleteNotificationSetup,
  getAvailableUsers,
  getActionTypes,
};
