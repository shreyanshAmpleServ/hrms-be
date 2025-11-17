const recognitionAwardService = require("../services/recognitionAwardService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createRecognitionAward = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await recognitionAwardService.createRecognitionAward(data);
    res.status(201).success("Recognition award created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findRecognitionAward = async (req, res, next) => {
  try {
    const reqData = await recognitionAwardService.findRecognitionAwardById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Recognition award not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateRecognitionAward = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await recognitionAwardService.updateRecognitionAward(
      req.params.id,
      data
    );
    res.status(200).success("Recognition award updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteRecognitionAward = async (req, res, next) => {
  try {
    await recognitionAwardService.deleteRecognitionAward(req.params.id);
    res.status(200).success("Recognition award deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllRecognitionAward = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await recognitionAwardService.getAllRecognitionAward(
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
  createRecognitionAward,
  findRecognitionAward,
  updateRecognitionAward,
  deleteRecognitionAward,
  getAllRecognitionAward,
};
