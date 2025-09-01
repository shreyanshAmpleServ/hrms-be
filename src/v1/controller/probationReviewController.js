const probationReviewService = require("../services/probationReviewService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createProbationReview = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await probationReviewService.createProbationReview(data);
    res.status(201).success("Probation review created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findProbationReview = async (req, res, next) => {
  try {
    const reqData = await probationReviewService.findProbationReviewById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Probation review not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateProbationReview = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await probationReviewService.updateProbationReview(
      req.params.id,
      data
    );
    res.status(200).success("Probation review updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteProbationReview = async (req, res, next) => {
  try {
    await probationReviewService.deleteProbationReview(req.params.id);
    res.status(200).success("Probation review deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllProbationReview = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await probationReviewService.getAllProbationReview(
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
  createProbationReview,
  findProbationReview,
  updateProbationReview,
  deleteProbationReview,
  getAllProbationReview,
};
