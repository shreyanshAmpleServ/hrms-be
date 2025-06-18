const leaveTypeService = require("../services/leaveTypeService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createLeaveType = async (req, res, next) => {
  try {
    let reqData = { ...req.body };
    const data = await leaveTypeService.createLeaveType(reqData);
    res.status(201).success("Leave type created successfully", data);
  } catch (error) {
    next(error);
  }
};

const findLeaveTypeById = async (req, res, next) => {
  try {
    const data = await leaveTypeService.findLeaveTypeById(req.params.id);
    if (!data) throw new CustomError("Leave type not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateLeaveType = async (req, res, next) => {
  try {
    let reqData = { ...req.body };

    const data = await leaveTypeService.updateLeaveType(req.params.id, reqData);
    res.status(200).success("Leave type updated successfully", data);
  } catch (error) {
    next(error);
  }
};

const deleteLeaveType = async (req, res, next) => {
  try {
    await leaveTypeService.deleteLeaveType(req.params.id);
    res.status(200).success("Leave type deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllLeaveType = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await leaveTypeService.getAllLeaveType(
      Number(page),
      Number(size),
      search,
      moment(startDate),
      moment(endDate)
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLeaveType,
  findLeaveTypeById,
  updateLeaveType,
  deleteLeaveType,
  getAllLeaveType,
};
