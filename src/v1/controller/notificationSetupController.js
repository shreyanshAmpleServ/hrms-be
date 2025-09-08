const notificationSetupService = require("../services/notificationSetupService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createNotificationSetup = async (req, res, next) => {
  try {
    let reqData = { ...req.body };
    const data = await notificationSetupService.createNotificationSetup(
      reqData
    );
    res.status(201).success("Notification setup created successfully", data);
  } catch (error) {
    next(error);
  }
};

const findNotificationSetupById = async (req, res, next) => {
  try {
    const data = await notificationSetupService.findNotificationSetupById(
      req.params.id
    );
    if (!data) throw new CustomError("Notification setup not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateNotificationSetup = async (req, res, next) => {
  try {
    let reqData = { ...req.body };

    const data = await notificationSetupService.updateNotificationSetup(
      req.params.id,
      reqData
    );
    res.status(200).success("Notification setup updated successfully", data);
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

const getAllNotificationSetup = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const data = await notificationSetupService.getAllNotificationSetup(
      Number(page),
      Number(size),
      search,
      moment(startDate),
      moment(endDate),
      is_active
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotificationSetup,
  findNotificationSetupById,
  updateNotificationSetup,
  deleteNotificationSetup,
  getAllNotificationSetup,
};
