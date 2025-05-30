const notificationLogModel = require("../models/notificationLogModel.js");

const createNotificationLog = async (data) => {
  return await notificationLogModel.createNotificationLog(data);
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
  endDate
) => {
  return await notificationLogModel.getAllNotificationLog(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createNotificationLog,
  findNotificationLogById,
  updateNotificationLog,
  deleteNotificationLog,
  getAllNotificationLog,
};
