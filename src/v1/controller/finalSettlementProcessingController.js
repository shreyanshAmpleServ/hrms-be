const finalSettlementProcessingService = require("../services/finalSettlementProcessingService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createFinalSettlementProcessing = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData =
      await finalSettlementProcessingService.createFinalSettlementProcessing(
        data
      );
    res
      .status(201)
      .success("Final Settlement Processing created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findFinalSettlementProcessing = async (req, res, next) => {
  try {
    const reqData =
      await finalSettlementProcessingService.findFinalSettlementProcessingById(
        req.params.id
      );
    res
      .status(200)
      .success("Final Settlement Processing retrieved successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const updateFinalSettlementProcessing = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData =
      await finalSettlementProcessingService.updateFinalSettlementProcessing(
        req.params.id,
        data
      );
    res
      .status(200)
      .success("Final Settlement Processing updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteFinalSettlementProcessing = async (req, res, next) => {
  try {
    await finalSettlementProcessingService.deleteFinalSettlementProcessing(
      req.params.id
    );
    res
      .status(200)
      .success("Final Settlement Processing  deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllFinalSettlementProcessing = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data =
      await finalSettlementProcessingService.getAllFinalSettlementProcessing(
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
  createFinalSettlementProcessing,
  findFinalSettlementProcessing,
  updateFinalSettlementProcessing,
  deleteFinalSettlementProcessing,
  getAllFinalSettlementProcessing,
};
