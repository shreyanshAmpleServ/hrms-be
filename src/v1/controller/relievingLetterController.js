const relievingLetterService = require("../services/relievingLetterService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createRelievingLetter = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await relievingLetterService.createRelievingLetter(data);
    res.status(201).success("Relieving letter created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findRelievingLetter = async (req, res, next) => {
  try {
    const reqData = await relievingLetterService.findRelievingLetterById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Relieving letter not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateRelievingLetter = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await relievingLetterService.updateRelievingLetter(
      req.params.id,
      data
    );
    res.status(200).success("Relieving letter updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteRelievingLetter = async (req, res, next) => {
  try {
    await relievingLetterService.deleteRelievingLetter(req.params.id);
    res.status(200).success("Relieving letter deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllRelievingLetters = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await relievingLetterService.getAllRelievingLetters(
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
  createRelievingLetter,
  findRelievingLetter,
  updateRelievingLetter,
  deleteRelievingLetter,
  getAllRelievingLetters,
};
