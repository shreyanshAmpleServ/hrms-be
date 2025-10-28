const hiringStageService = require("../services/hiringStageService.js");
const CustomError = require("../../utils/CustomError");

const createHiringStage = async (req, res, next) => {
  try {
    const hiringStage = await hiringStageService.createHiringStage(req.body);
    res.status(201).success("Hiring Stage created successfully", hiringStage);
  } catch (error) {
    next(error);
  }
};

const getHiringStageById = async (req, res, next) => {
  try {
    const hiringStage = await hiringStageService.getHiringStageById(
      req.params.id
    );
    if (!hiringStage) throw new CustomError("Hiring Stage not found", 404);
    res.status(200).success(null, hiringStage);
  } catch (error) {
    next(error);
  }
};

const updateHiringStage = async (req, res, next) => {
  try {
    const hiringStage = await hiringStageService.updateHiringStage(
      req.params.id,
      req.body
    );
    res.status(200).success("Hiring Stage updated successfully", hiringStage);
  } catch (error) {
    next(error);
  }
};

const deleteHiringStage = async (req, res, next) => {
  try {
    await hiringStageService.deleteHiringStage(req.params.id);
    res.status(200).success("Hiring Stage deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllHiringStages = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, status } = req.query;

    // FIXED: Correct parameter order and proper null handling
    const hiringStages = await hiringStageService.getAllHiringStages(
      search || null, // 1st
      Number(page) || 1, // 2nd
      Number(size) || 10, // 3rd
      startDate && startDate.trim() ? startDate : null, // 4th
      endDate && endDate.trim() ? endDate : null, // 5th
      status && status.trim() ? status : null // 6th
    );

    res.status(200).success(null, hiringStages);
  } catch (error) {
    next(error);
  }
};

const updateHiringStageStatus = async (req, res, next) => {
  try {
    const hiringStage = await hiringStageService.updateHiringStageStatus(
      req.params.id,
      req.body
    );
    res
      .status(200)
      .success("Hiring Stage status updated successfully", hiringStage);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHiringStage,
  getHiringStageById,
  updateHiringStage,
  deleteHiringStage,
  getAllHiringStages,
  updateHiringStageStatus,
};
