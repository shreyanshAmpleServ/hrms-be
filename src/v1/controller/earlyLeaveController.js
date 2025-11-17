const earlyLeaveService = require("../services/earlyLeaveService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createEarlyLeave = async (req, res, next) => {
  try {
    let reqData = { ...req.body };
    const data = await earlyLeaveService.createEarlyLeave(reqData);
    res.status(201).success("Early leave request created successfully", data);
  } catch (error) {
    next(error);
  }
};

const findEarlyLeaveById = async (req, res, next) => {
  try {
    const data = await earlyLeaveService.findEarlyLeaveById(req.params.id);
    if (!data) throw new CustomError("Early leave request not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateEarlyLeave = async (req, res, next) => {
  try {
    let reqData = { ...req.body };

    const data = await earlyLeaveService.updateEarlyLeave(
      req.params.id,
      reqData
    );
    res.status(200).success("Early leave request updated successfully", data);
  } catch (error) {
    next(error);
  }
};

const deleteEarlyLeave = async (req, res, next) => {
  try {
    await earlyLeaveService.deleteEarlyLeave(req.params.id);
    res.status(200).success("Early leave request deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllEarlyLeave = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, status, employee_id } =
      req.query;
    const data = await earlyLeaveService.getAllEarlyLeave(
      Number(page),
      Number(size),
      search,
      startDate ? moment(startDate) : null,
      endDate ? moment(endDate) : null,
      status,
      employee_id ? Number(employee_id) : null
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateEarlyLeaveStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const approvedBy = req.user?.employee_id || req.body.approved_by;

    const data = await earlyLeaveService.updateEarlyLeaveStatus(
      req.params.id,
      status,
      approvedBy,
      remarks
    );
    res.status(200).success("Early leave status updated successfully", data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEarlyLeave,
  findEarlyLeaveById,
  updateEarlyLeave,
  deleteEarlyLeave,
  getAllEarlyLeave,
  updateEarlyLeaveStatus,
};
