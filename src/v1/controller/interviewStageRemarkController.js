const interviewStageRemarkService = require("../services/interviewStageRemarkService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");

const createInterviewStageRemark = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };

    const reqData =
      await interviewStageRemarkService.createInterviewStageRemark(data);
    res
      .status(201)
      .success("Interview stage Remark created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findInterviewStageRemarkById = async (req, res, next) => {
  try {
    const reqData =
      await interviewStageRemarkService.findInterviewStageRemarkById(
        req.params.id
      );

    if (!reqData)
      throw new CustomError("Interview stage remark not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateInterviewStageRemark = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData =
      await interviewStageRemarkService.updateInterviewStageRemark(
        req.params.id,
        data
      );
    res
      .status(200)
      .success("Interview stage  remark updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteInterviewStageRemark = async (req, res, next) => {
  try {
    const reqData =
      await interviewStageRemarkService.deleteInterviewStageRemark(
        req.params.id
      );
    res
      .status(200)
      .success("Interview stage remark deleted successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const getAllInterviewStageRemark = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, candidateId } = req.query;
    const data = await interviewStageRemarkService.getAllInterviewStageRemark(
      search,
      Number(page),
      Number(size),
      candidateId,
      startDate && moment(startDate),
      endDate && moment(endDate)
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateInterviewStageRemarkStatus = async (req, res, next) => {
  try {
    console.log("Approver ID from token:", req.user.employee_id);

    const status = req.body.status;
    const rejection_reason = req.body.rejection_reason || "";
    console.log("User : ", req.user);
    const data = {
      status,
      rejection_reason,
      updatedby: req.user.employee_id,
      approver_id: req.user.employee_id,
      updatedate: new Date(),
    };

    const reqData =
      await interviewStageRemarkService.updateInterviewStageRemarkStatus(
        req.params.id,
        data
      );
    res
      .status(200)
      .success("Interview stage remark status updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterviewStageRemark,
  findInterviewStageRemarkById,
  updateInterviewStageRemark,
  deleteInterviewStageRemark,
  getAllInterviewStageRemark,
  updateInterviewStageRemarkStatus,
};
