const notificationSetupModel = require("../models/notificationSetupModel");
const { getPrisma } = require("../../config/prismaContext.js");

const createNotificationSetup = async (data) => {
  return await notificationSetupModel.createNotificationSetup(data);
};

const findNotificationSetupById = async (id) => {
  return await notificationSetupModel.findNotificationSetupById(id);
};

const updateNotificationSetup = async (id, data) => {
  return await notificationSetupModel.updateNotificationSetup(id, data);
};

const deleteNotificationSetup = async (id) => {
  return await notificationSetupModel.deleteNotificationSetup(id);
};

const getAllNotificationSetup = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await notificationSetupModel.getAllNotificationSetup(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createNotificationSetup,
  findNotificationSetupById,
  updateNotificationSetup,
  deleteNotificationSetup,
  getAllNotificationSetup,
};
