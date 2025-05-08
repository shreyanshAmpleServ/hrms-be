const leaveTypeModel = require('../models/leaveTypeModel');

const createLeaveType = async (data) => {
  return await leaveTypeModel.createLeaveType(data);
};

const findLeaveTypeById = async (id) => {
  return await leaveTypeModel.findLeaveTypeById(id);
};

const updateLeaveType = async (id, data) => {
  return await leaveTypeModel.updateLeaveType(id, data);
};

const deleteLeaveType = async (id) => {
  return await leaveTypeModel.deleteLeaveType(id);
};

const getAllLeaveType = async (page, size, search,  startDate,endDate) => {
  return await leaveTypeModel.getAllLeaveType(page, size, search,  startDate,endDate);
};

module.exports = {
  createLeaveType,
  findLeaveTypeById,
  updateLeaveType,
  deleteLeaveType,
  getAllLeaveType,
};