const advancePaymentService = require("../services/advancePaymentService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");

const createAdvancePayment = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.employee_id,
      log_inst: req.user.log_inst,
    };
    const reqData = await advancePaymentService.createAdvancePayment(data);
    res.status(201).success("Advance payment created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findAdvancePayment = async (req, res, next) => {
  try {
    const reqData = await advancePaymentService.findAdvancePaymentById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Advance payment not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateAdvancePayment = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await advancePaymentService.updateAdvancePayment(
      req.params.id,
      data
    );
    res.status(200).success("Advance payment updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteAdvancePayment = async (req, res, next) => {
  try {
    await advancePaymentService.deleteAdvancePayment(req.params.id);
    res.status(200).success("Advance payment deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllAdvancePayments = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await advancePaymentService.getAllAdvancePayments(
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

const updateAdvancePaymentStatus = async (req, res, next) => {
  try {
    console.log("Approver ID from token:", req.user.employee_id);

    const status = req.body.status;
    const reason = req.body.reason || "";
    const data = {
      status,
      reason,
      updatedby: req.user.employee_id,
      approver_by: req.user.employee_id,
      updatedate: new Date(),
    };

    const reqData = await advancePaymentService.updateAdvancePaymentStatus(
      req.params.id,
      data
    );
    res.status(200).success("Leave status updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAdvancePayment,
  findAdvancePayment,
  updateAdvancePayment,
  deleteAdvancePayment,
  getAllAdvancePayments,
  updateAdvancePaymentStatus,
};
