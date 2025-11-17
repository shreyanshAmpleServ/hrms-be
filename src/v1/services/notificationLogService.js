const notificationLogModel = require("../models/notificationLogModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createNotificationLog = async (data, user) => {
  return await notificationLogModel.createNotificationLog(data, user);
};

const findNotificationLogById = async (id) => {
  return await notificationLogModel.findNotificationLogById(id);
};

const updateNotificationLog = async (id, data) => {
  return await notificationLogModel.updateNotificationLog(id, data);
};

const deleteNotificationLog = async (id) => {
  return await notificationLogModel.deleteNotificationLog(id);
};

const getAllNotificationLog = async (
  search,
  page,
  size,
  startDate,
  endDate,
  user
) => {
  return await notificationLogModel.getAllNotificationLog(
    search,
    page,
    size,
    startDate,
    endDate,
    user
  );
};

module.exports = {
  createNotificationLog,
  findNotificationLogById,
  updateNotificationLog,
  deleteNotificationLog,
  getAllNotificationLog,
};
