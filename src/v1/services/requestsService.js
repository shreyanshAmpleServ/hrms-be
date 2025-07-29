const requestsModel = require("../models/requestsModel.js");

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

const getAllRequests = async (search, page, size, startDate, endDate) => {
  return await requestsModel.getAllRequests(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createRequest,
  findRequests,
  updateRequests,
  deleteRequests,
  getAllRequests,
};
