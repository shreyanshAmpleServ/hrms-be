const notificationLogService = require("../services/notificationLogService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createNotificationLog = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await notificationLogService.createNotificationLog(data);
    res.status(201).success("Notification log created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findNotificationLog = async (req, res, next) => {
  try {
    const reqData = await notificationLogService.findNotificationLogById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Notification log not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateNotificationLog = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await notificationLogService.updateNotificationLog(
      req.params.id,
      data
    );
    res.status(200).success("Notification log updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteNotificationLog = async (req, res, next) => {
  try {
    await notificationLogService.deleteNotificationLog(req.params.id);
    res.status(200).success("Notification log deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllNotificationLog = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await notificationLogService.getAllNotificationLog(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      req.user
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotificationLog,
  findNotificationLog,
  updateNotificationLog,
  deleteNotificationLog,
  getAllNotificationLog,
};
