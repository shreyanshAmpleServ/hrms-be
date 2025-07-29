const requestsModel = require("../controller/requestsController.js");

const createRequest = async (data) => {
  return await requestsModel.createRequest(data);
};

const findRequests = async (data) => {};
