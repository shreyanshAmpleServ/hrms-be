const requestApprovalModel = require("../models/requestApprovalModel.js");

const createRequestApproval = async (data) => {
  return await requestApprovalModel.createRequestApproval(data);
};

const findRequestApproval = async (request_id) => {
  return await requestApprovalModel.findRequestApproval(request_id);
};

const updateRequestApproval = async (id, data) => {
  return await requestApprovalModel.updateRequestApproval(id, data);
};

const deleteRequestApproval = async (id) => {
  return await requestApprovalModel.deleteRequestApproval(id);
};

const getAllRequestApproval = async (
  search,
  page,
  size,
  startDate,
  endDate,
  request_type,
  approver_id,
  status
) => {
  return await requestApprovalModel.getAllRequestApproval(
    search,
    page,
    size,
    startDate,
    endDate,
    request_type,
    approver_id,
    status
  );
};

module.exports = {
  createRequestApproval,
  findRequestApproval,
  updateRequestApproval,
  deleteRequestApproval,
  getAllRequestApproval,
};
