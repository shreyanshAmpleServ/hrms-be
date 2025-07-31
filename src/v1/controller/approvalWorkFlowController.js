const approvalWorkFlowService = require("../services/approvalWorkFlowService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");

const createApprovalWorkFlow = async (req, res, next) => {
  try {
    let dataArray = req.body;

    if (!Array.isArray(dataArray)) {
      dataArray = [dataArray];
    }

    dataArray = dataArray.map((item) => ({
      ...item,
      createdby: req.user?.id || 1,
      log_inst: req.user?.log_inst || 1,
    }));

    const reqData = await approvalWorkFlowService.createApprovalWorkFlow(
      dataArray
    );

    res.status(201).success("Approval workflow created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findApprovalWorkFlow = async (req, res, next) => {
  try {
    const reqData = await approvalWorkFlowService.findApprovalWorkFlow(
      req.params.id
    );
    if (!reqData) throw new CustomError("Approval workflow not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const getAllApprovalWorkFlow = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await approvalWorkFlowService.getAllApprovalWorkFlow(
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

const updateApprovalWorkFlow = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await approvalWorkFlowService.updateApprovalWorkFlow(
      req.params.id,
      data
    );
    res.status(200).success("Approval workflow  updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteApprovalWorkFlow = async (req, res, next) => {
  try {
    await approvalWorkFlowService.deleteApprovalWorkFlow(req.params.id);
    res.status(200).success("Approval  workflow deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApprovalWorkFlow,
  getAllApprovalWorkFlow,
  findApprovalWorkFlow,
  updateApprovalWorkFlow,
  deleteApprovalWorkFlow,
};
