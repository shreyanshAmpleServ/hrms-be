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
    const { page, size, search, startDate, endDate } = req.query;
    const data = await interviewStageRemarkService.getAllInterviewStageRemark(
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

module.exports = {
  createInterviewStageRemark,
  findInterviewStageRemarkById,
  updateInterviewStageRemark,
  deleteInterviewStageRemark,
  getAllInterviewStageRemark,
};
