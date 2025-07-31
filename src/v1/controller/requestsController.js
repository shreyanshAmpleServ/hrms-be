const requestsService = require("../services/requestsService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");

const createRequest = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await requestsService.createRequest(data);
    res.status(201).success("Request created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findRequests = async (req, res, next) => {
  try {
    const reqData = await requestsService.findRequests(req.params.id); // FIXED
    if (!reqData) throw new CustomError("Requests not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const getAllRequests = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await requestsService.getAllRequests(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate)
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateRequests = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };

    const reqData = await requestsService.updateRequests(req.params.id, data);
    res.status(200).success("Requests updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteRequests = async (req, res, next) => {
  try {
    await requestsService.deleteRequests(req.params.id);
    res.status(200).success("Requests deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

// const takeActionOnRequest = async (req, res) => {
//   try {
//     const result = await requestsService.takeActionOnRequest(req.body);
//     res.status(200).json({ success: true, data: result });
//   } catch (err) {
//     res
//       .status(err.status || 500)
//       .json({ success: false, message: err.message });
//   }
// };

const takeActionOnRequest = async (req, res) => {
  try {
    const result = await requestsService.takeActionOnRequest(req.body);

    res.status(200).success("Action done successfully", result);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createRequest,
  getAllRequests,
  findRequests,
  updateRequests,
  deleteRequests,
  takeActionOnRequest,
};
