const paymentRecoveryService = require("../services/paymentRecoveryService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createPaymentRecovery = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };

    const reqData = await paymentRecoveryService.createPaymentRecovery(data);
    res.status(201).success("Payment recovery created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findPaymentRecovery = async (req, res, next) => {
  try {
    const reqData = await paymentRecoveryService.findPaymentRecoveryById(
      req.params.id
    );

    if (!reqData) throw new CustomError("Payment recovery not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updatePaymentRecovery = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };

    const reqData = await paymentRecoveryService.updatePaymentRecovery(
      req.params.id,
      data
    );

    res.status(200).success("Payment recovery updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deletePaymentRecovery = async (req, res, next) => {
  try {
    await paymentRecoveryService.deletePaymentRecovery(req.params.id);
    res.status(200).success("Payment recovery deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllPaymentRecovery = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, employee_id } = req.query;

    const data = await paymentRecoveryService.getAllPaymentRecovery(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      employee_id
    );

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const getPaymentRecoveryStats = async (req, res, next) => {
  try {
    const data = await paymentRecoveryService.getPaymentRecoveryStats();
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updatePaymentRecoveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedBy = req.user?.id || 1;

    const result = await paymentRecoveryService.updatePaymentRecoveryStatus(
      id,
      status,
      updatedBy
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in updatePaymentRecoveryStatus:", error);
    next(error);
  }
};
module.exports = {
  createPaymentRecovery,
  findPaymentRecovery,
  updatePaymentRecovery,
  deletePaymentRecovery,
  getAllPaymentRecovery,
  getPaymentRecoveryStats,
  updatePaymentRecoveryStatus,
};
