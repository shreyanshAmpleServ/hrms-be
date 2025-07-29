const approvalWorkFlowModel = require("../models/approvalWorkFlowModel.js");

const createApprovalWorkFlow = async (data) => {
  return await approvalWorkFlowModel.createApprovalWorkFlow(data);
};

const findApprovalWorkFlow = async (request_id) => {
  return await approvalWorkFlowModel.findApprovalWorkFlow(request_id);
};

const updateApprovalWorkFlow = async (id, data) => {
  return await approvalWorkFlowModel.updateApprovalWorkFlow(id, data);
};

const deleteApprovalWorkFlow = async (id) => {
  return await approvalWorkFlowModel.deleteApprovalWorkFlow(id);
};

const getAllApprovalWorkFlow = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await approvalWorkFlowModel.getAllApprovalWorkFlow(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createApprovalWorkFlow,
  findApprovalWorkFlow,
  updateApprovalWorkFlow,
  deleteApprovalWorkFlow,
  getAllApprovalWorkFlow,
};
