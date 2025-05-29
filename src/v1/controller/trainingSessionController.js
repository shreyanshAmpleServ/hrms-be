const trainingSessionService = require("../services/trainingSessionService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");

// Create
const createTrainingSession = async (req, res, next) => {
  try {
    console.log("Request body received:", req.body); // <-- Add this here

    const data = { ...req.body, createdby: req.user.id };

    const result = await trainingSessionService.createTrainingSession(data);
    res.status(201).success("Training Session Created Successfully", result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Get by ID
const findTrainingSessionById = async (req, res, next) => {
  try {
    const data = await trainingSessionService.getTrainingSessionById(
      req.params.id
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Update
const updateTrainingSession = async (req, res, next) => {
  try {
    const data = await trainingSessionService.updateTrainingSession(
      req.params.id,
      req.body
    );
    res.status(200).success("Training Session updated Successfully", data);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Delete
const deleteTrainingSession = async (req, res, next) => {
  try {
    await trainingSessionService.deleteTrainingSession(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Training session deleted" });
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Get all
const getAllTrainingSession = async (req, res, next) => {
  try {
    const { search, page, size, startDate, endDate } = req.query;
    const data = await trainingSessionService.getAllTrainingSession(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate)
    );
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

module.exports = {
  createTrainingSession,
  findTrainingSessionById,
  updateTrainingSession,
  deleteTrainingSession,
  getAllTrainingSession,
};
