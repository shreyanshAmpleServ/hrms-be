const BasicPayService = require("../services/BasicPayService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createBasicPay = async (req, res, next) => {
  try {
    let reqData = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
      payLineData: JSON.parse(req.body?.payLineData),
    };

    const deal = await BasicPayService.createBasicPay(reqData);
    res.status(201).success("Basic pay created successfully", deal);
  } catch (error) {
    next(error);
  }
};

const findBasicPayById = async (req, res, next) => {
  try {
    const deal = await BasicPayService.findBasicPayById(req.params.id);
    if (!deal) throw new CustomError("Basic pay not found", 404);
    res.status(200).success(null, deal);
  } catch (error) {
    next(error);
  }
};

const updateBasicPay = async (req, res, next) => {
  try {
    const existingData = await BasicPayService.findBasicPayById(req.params.id);
    if (!existingData) throw new CustomError("Basic pay not found", 404);

    let reqData = {
      ...req.body,
      updatedby: req.user.id,
      payLineData: req.body?.payLineData
        ? JSON.parse(req.body?.payLineData)
        : null,
    };

    const deal = await BasicPayService.updateBasicPay(req.params.id, reqData);
    res.status(200).success("Basic pay updated successfully", deal);
  } catch (error) {
    next(error);
  }
};

const deleteBasicPay = async (req, res, next) => {
  try {
    const existingData = await BasicPayService.findBasicPayById(req.params.id);
    if (!existingData) throw new CustomError("Basic pay not found", 404);
    await BasicPayService.deleteBasicPay(req.params.id);
    res.status(200).success("Basic pay deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllBasicPay = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, status } = req.query;
    const deals = await BasicPayService.getAllBasicPay(
      Number(page),
      Number(size),
      search,
      moment(startDate),
      moment(endDate),
      status
    );
    res.status(200).success(null, deals);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBasicPay,
  findBasicPayById,
  updateBasicPay,
  deleteBasicPay,
  getAllBasicPay,
};
