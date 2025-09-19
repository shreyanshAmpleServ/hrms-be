const earlyLeaveModel = require("../models/earlyLeaveModel");

const createEarlyLeave = async (data) => {
  return await earlyLeaveModel.createEarlyLeave(data);
};

const findEarlyLeaveById = async (id) => {
  return await earlyLeaveModel.findEarlyLeaveById(id);
};

const updateEarlyLeave = async (id, data) => {
  return await earlyLeaveModel.updateEarlyLeave(id, data);
};

const deleteEarlyLeave = async (id) => {
  return await earlyLeaveModel.deleteEarlyLeave(id);
};

const getAllEarlyLeave = async (
  page,
  size,
  search,
  startDate,
  endDate,
  status
) => {
  return await earlyLeaveModel.getAllEarlyLeave(
    page,
    size,
    search,
    startDate,
    endDate,
    status
  );
};

const updateEarlyLeaveStatus = async (
  id,
  status,
  approvedBy = null,
  remarks = null
) => {
  return await earlyLeaveModel.updateEarlyLeaveStatus(
    id,
    status,
    approvedBy,
    remarks
  );
};

module.exports = {
  createEarlyLeave,
  findEarlyLeaveById,
  updateEarlyLeave,
  deleteEarlyLeave,
  getAllEarlyLeave,
  updateEarlyLeaveStatus,
};
