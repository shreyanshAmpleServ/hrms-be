const requestsService = require("../services/requestsService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");
const logger = require("../../Comman/logger/index.js");

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
    const { page, size, search, startDate, endDate, requestType, status } =
      req.query;
    const data = await requestsService.getAllRequests(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      requestType,
      status
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

const takeActionOnRequest = async (req, res) => {
  try {
    const result = await requestsService.takeActionOnRequest({
      ...req.body,
      acted_by: req.user.employee_id,
      log_inst: req.user.log_inst,
    });

    res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  }
};

const findRequestByRequestTypeAndReferenceId = async (req, res, next) => {
  try {
    const result = await requestsService.findRequestByRequestTypeAndReferenceId(
      req.query
    );
    res.status(200).success("Request found successfully", result);
  } catch (error) {
    logger.debug(error);
    next(error);
  }
};

const findRequestByRequestUsers = async (req, res, next) => {
  const {
    search,
    page,
    size,
    request_type,
    requester_id,
    status,
    startDate,
    endDate,
    overall_status,
  } = req.query;
  try {
    const result = await requestsService.findRequestByRequestUsers(
      search,
      Number(page),
      Number(size),
      Number(req?.user?.employee_id),
      request_type,
      status,
      Number(requester_id),
      startDate || null,
      endDate || null,
      overall_status || null
    );
    res.status(200).success("Request found successfully", result);
  } catch (error) {
    logger.debug(error);
    next(error);
  }
};

// const takeActionOnRequest = async (req, res, next) => {
//   try {
//     const io = req.app.get("io");
//     const result = await requestsService.takeActionOnRequest({
//       ...req.body,
//       io,
//     });

//     res.status(200).success("Action done successfully", result);
//   } catch (error) {
//     next(error);
//   }
// };

module.exports = {
  createRequest,
  getAllRequests,
  findRequests,
  updateRequests,
  deleteRequests,
  findRequestByRequestTypeAndReferenceId,
  findRequestByRequestUsers,
  takeActionOnRequest,
};
