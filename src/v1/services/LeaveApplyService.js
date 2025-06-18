const LeaveApplyModel = require("../models/LeaveApplyModel");

const createLeaveApplication = async (data) => {
  return await LeaveApplyModel.createLeaveApplication(data);
};

const findLeaveApplicationById = async (id) => {
  return await LeaveApplyModel.findLeaveApplicationById(id);
};

const updateLeaveApplication = async (id, data) => {
  return await LeaveApplyModel.updateLeaveApplication(id, data);
};

const deleteLeaveApplication = async (id) => {
  return await LeaveApplyModel.deleteLeaveApplication(id);
};

const getAllLeaveApplication = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await LeaveApplyModel.getAllLeaveApplication(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

const updateLeaveStatus = async (id, data) => {
  return await LeaveApplyModel.updateLeaveStatus(id, data);
};

module.exports = {
  createLeaveApplication,
  findLeaveApplicationById,
  updateLeaveApplication,
  deleteLeaveApplication,
  getAllLeaveApplication,
  updateLeaveStatus,
};
