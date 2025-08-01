const requestsModel = require("../models/requestsModel.js");
const logger = require("../../Comman/logger/index.js");
const createRequest = async (data) => {
  return await requestsModel.createRequest(data);
};

const findRequests = async (request_id) => {
  return await requestsModel.findRequests(request_id);
};

const updateRequests = async (id, data) => {
  return await requestsModel.updateRequests(id, data);
};

const deleteRequests = async (id) => {
  return await requestsModel.deleteRequests(id);
};

const getAllRequests = async (
  search,
  page,
  size,
  startDate,
  endDate,
  requestType,
  status
) => {
  return await requestsModel.getAllRequests(
    search,
    page,
    size,
    startDate,
    endDate,
    requestType,
    status
  );
};

const findRequestByRequestTypeAndReferenceId = async (request) => {
  return await requestsModel.findRequestByRequestTypeAndReferenceId(request);
};

const findRequestByRequestUsers = async (employee_id) => {
  return await requestsModel.findRequestByRequestUsers(employee_id);
};

const takeActionOnRequest = async (data) => {
  const { io, ...rest } = data;
  return await requestsModel.takeActionOnRequest({ ...rest, io });
};
module.exports = {
  createRequest,
  findRequests,
  updateRequests,
  deleteRequests,
  getAllRequests,
  findRequestByRequestTypeAndReferenceId,
  takeActionOnRequest,
  findRequestByRequestUsers,
};
