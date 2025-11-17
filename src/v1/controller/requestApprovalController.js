const requestApprovalService = require("../services/requestApprovalService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createRequestApproval = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await requestApprovalService.createRequestApproval(data);
    res.status(201).success("Request  Approval created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findRequestApproval = async (req, res, next) => {
  try {
    const reqData = await requestApprovalService.findRequestApproval(
      req.params.id
    );
    if (!reqData) throw new CustomError("Requests Approval not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const getAllRequestApproval = async (req, res, next) => {
  try {
    const {
      page,
      size,
      search,
      startDate,
      endDate,
      request_type,
      approver_id,
      status,
    } = req.query;
    const data = await requestApprovalService.getAllRequestApproval(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      request_type,
      approver_id,
      status
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateRequestApproval = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await requestApprovalService.updateRequestApproval(
      req.params.id,
      data
    );
    res.status(200).success("Requests Approval  updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteRequestApproval = async (req, res, next) => {
  try {
    await requestApprovalService.deleteRequestApproval(req.params.id);
    res.status(200).success("Requests  Approval deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequestApproval,
  getAllRequestApproval,
  findRequestApproval,
  updateRequestApproval,
  deleteRequestApproval,
};
