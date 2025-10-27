const hiringStageValueService = require("../services/hiringStageValueService.js");
const CustomError = require("../../utils/CustomError");

const createHiringStageValue = async (req, res, next) => {
  try {
    const hiringStageValue =
      await hiringStageValueService.createHiringStageValue(req.body);
    res
      .status(201)
      .success("Hiring Stage Value created successfully", hiringStageValue);
  } catch (error) {
    next(error);
  }
};

const getHiringStageValueById = async (req, res, next) => {
  try {
    const hiringStageValue =
      await hiringStageValueService.getHiringStageValueById(req.params.id);
    if (!hiringStageValue)
      throw new CustomError("Hiring Stage Value not found", 404);
    res.status(200).success(null, hiringStageValue);
  } catch (error) {
    next(error);
  }
};

const updateHiringStageValue = async (req, res, next) => {
  try {
    const hiringStageValue =
      await hiringStageValueService.updateHiringStageValue(
        req.params.id,
        req.body
      );
    res
      .status(200)
      .success("Hiring Stage Value updated successfully", hiringStageValue);
  } catch (error) {
    next(error);
  }
};

const deleteHiringStageValue = async (req, res, next) => {
  try {
    await hiringStageValueService.deleteHiringStageValue(req.params.id);
    res.status(200).success("Hiring Stage Value deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllHiringStageValues = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, status } = req.query;

    const hiringStageValues =
      await hiringStageValueService.getAllHiringStageValues(
        search || null,
        Number(page) || 1,
        Number(size) || 10,
        startDate && startDate.trim() ? startDate : null,
        endDate && endDate.trim() ? endDate : null,
        status && status.trim() ? status : null
      );

    res.status(200).success(null, hiringStageValues);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHiringStageValue,
  getHiringStageValueById,
  updateHiringStageValue,
  deleteHiringStageValue,
  getAllHiringStageValues,
};
