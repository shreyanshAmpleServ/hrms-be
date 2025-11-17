const statutoryRateService = require("../services/statutoryRateService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createStatutoryRate = async (req, res, next) => {
  try {
    let StatutoryData = { ...req.body };
    const statutoryRate = await statutoryRateService.createStatutoryRate(
      StatutoryData
    );
    res
      .status(201)
      .success("Statutory rate created successfully", statutoryRate);
  } catch (error) {
    next(error);
  }
};

const findStatutoryRateById = async (req, res, next) => {
  try {
    const statutoryRate = await statutoryRateService.findStatutoryRateById(
      req.params.id
    );
    if (!statutoryRate) throw new CustomError("Statutory rate not found", 404);

    res.status(200).success(null, statutoryRate);
  } catch (error) {
    next(error);
  }
};

const updateStatutoryRate = async (req, res, next) => {
  try {
    // const attachmentPath = req.file ? req.file.path : null;
    let StatutoryData = { ...req.body };
    // if (attachmentPath) StatutoryData.attachment = generateFullUrl(req, attachmentPath);

    // StatutoryData = sanitizeStatutoryData(StatutoryData);

    const statutoryRate = await statutoryRateService.updateStatutoryRate(
      req.params.id,
      StatutoryData
    );
    res
      .status(200)
      .success("Statutory rate updated successfully", statutoryRate);
  } catch (error) {
    next(error);
  }
};

const deleteStatutoryRate = async (req, res, next) => {
  try {
    await statutoryRateService.deleteStatutoryRate(req.params.id);
    res.status(200).success("Statutory rate deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllStatutoryRate = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const statutoryRate = await statutoryRateService.getAllStatutoryRate(
      Number(page),
      Number(size),
      search,
      moment(startDate),
      moment(endDate),
      is_active
    );
    res.status(200).success(null, statutoryRate);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStatutoryRate,
  findStatutoryRateById,
  updateStatutoryRate,
  deleteStatutoryRate,
  getAllStatutoryRate,
};
