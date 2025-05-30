const suggestionBoxService = require("../services/suggestionBoxService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createSuggestionBox = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body); // ADD THIS LINE

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await suggestionBoxService.createSuggestionBox(data);
    res.status(201).success("Suggestion box created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findSuggestionBox = async (req, res, next) => {
  try {
    const reqData = await suggestionBoxService.findSuggestionBoxById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Suggestion box not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateSuggestionBox = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await suggestionBoxService.updateSuggestionBox(
      req.params.id,
      data
    );
    res.status(200).success("Suggestion box updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteSuggestionBox = async (req, res, next) => {
  try {
    await suggestionBoxService.deleteSuggestionBox(req.params.id);
    res.status(200).success("Suggestion box deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllSuggestionBox = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await suggestionBoxService.getAllSuggestionBox(
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
  createSuggestionBox,
  findSuggestionBox,
  updateSuggestionBox,
  deleteSuggestionBox,
  getAllSuggestionBox,
};
