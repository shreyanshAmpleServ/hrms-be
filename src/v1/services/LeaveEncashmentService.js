const LeaveEncashmentModel = require("../models/LeaveEncashmentModel");
const { getPrisma } = require("../../config/prismaContext.js");

const createLeaveEncashment = async (data) => {
  return await LeaveEncashmentModel.createLeaveEncashment(data);
};

const findLeaveEncashmentById = async (id) => {
  return await LeaveEncashmentModel.findLeaveEncashmentById(id);
};

const updateLeaveEncashment = async (id, data) => {
  return await LeaveEncashmentModel.updateLeaveEncashment(id, data);
};

const deleteLeaveEncashment = async (id) => {
  return await LeaveEncashmentModel.deleteLeaveEncashment(id);
};

const getAllLeaveEncashment = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await LeaveEncashmentModel.getAllLeaveEncashment(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

const updateLeaveEnchashmentStatus = async (id, data) => {
  return await LeaveEncashmentModel.updateLeaveEnchashmentStatus(id, data);
};

module.exports = {
  createLeaveEncashment,
  findLeaveEncashmentById,
  updateLeaveEncashment,
  deleteLeaveEncashment,
  getAllLeaveEncashment,
  updateLeaveEnchashmentStatus,
};
