// const approvalWorkFlowModel = require("../models/approvalWorkFlowModel.js");

// const createApprovalWorkFlow = async (data) => {
//   return await approvalWorkFlowModel.createApprovalWorkFlow(data);
// };

// const findApprovalWorkFlow = async (request_id) => {
//   return await approvalWorkFlowModel.findApprovalWorkFlow(request_id);
// };

// const updateApprovalWorkFlow = async (id, data) => {
//   return await approvalWorkFlowModel.updateApprovalWorkFlow(id, data);
// };

// const deleteApprovalWorkFlow = async (requestType) => {
//   return await approvalWorkFlowModel.deleteApprovalWorkFlow(requestType);
// };

// const deleteApprovalWorkFlows = async (ids) => {
//   return await approvalWorkFlowModel.deleteApprovalWorkFlows(ids);
// };

// const getAllApprovalWorkFlowByRequest = async (requestType) => {
//   return await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
//     requestType
//   );
// };

// const getAllApprovalWorkFlow = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate
// ) => {
//   return await approvalWorkFlowModel.getAllApprovalWorkFlow(
//     search,
//     page,
//     size,
//     startDate,
//     endDate
//   );
// };

// module.exports = {
//   createApprovalWorkFlow,
//   findApprovalWorkFlow,
//   updateApprovalWorkFlow,
//   deleteApprovalWorkFlow,
//   deleteApprovalWorkFlows,
//   getAllApprovalWorkFlow,
//   getAllApprovalWorkFlowByRequest,
// };

const approvalWorkFlowModel = require("../models/approvalWorkFlowModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createApprovalWorkFlow = async (data) => {
  return await approvalWorkFlowModel.createApprovalWorkFlow(data);
};

const findApprovalWorkFlow = async (request_id) => {
  return await approvalWorkFlowModel.findApprovalWorkFlow(request_id);
};

const updateApprovalWorkFlow = async (id, data) => {
  return await approvalWorkFlowModel.updateApprovalWorkFlow(id, data);
};

const deleteApprovalWorkFlow = async (requestType) => {
  return await approvalWorkFlowModel.deleteApprovalWorkFlow(requestType);
};

const deleteApprovalWorkFlows = async (ids) => {
  return await approvalWorkFlowModel.deleteApprovalWorkFlows(ids);
};

const getAllApprovalWorkFlowByRequest = async (
  requestType,
  departmentId,
  designationId
) => {
  return await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
    requestType,
    departmentId,
    designationId
  );
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
  deleteApprovalWorkFlows,
  getAllApprovalWorkFlow,
  getAllApprovalWorkFlowByRequest,
};
