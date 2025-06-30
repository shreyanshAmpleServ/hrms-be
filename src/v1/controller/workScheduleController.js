const workScheduleService = require("../services/workScheduleService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createWorkSchedule = async (req, res, next) => {
  try {
    let reqData = { ...req.body };
    const data = await workScheduleService.createWorkSchedule(reqData);
    res.status(201).success("Work schedule created successfully", data);
  } catch (error) {
    next(error);
  }
};

const findWorkScheduleById = async (req, res, next) => {
  try {
    const data = await workScheduleService.findWorkScheduleById(req.params.id);
    if (!data) throw new CustomError("Work schedule not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateWorkSchedule = async (req, res, next) => {
  try {
    let reqData = { ...req.body };

    const data = await workScheduleService.updateWorkSchedule(
      req.params.id,
      reqData
    );
    res.status(200).success("Work schedule updated successfully", data);
  } catch (error) {
    next(error);
  }
};

const deleteWorkSchedule = async (req, res, next) => {
  try {
    await workScheduleService.deleteWorkSchedule(req.params.id);
    res.status(200).success("Work schedule deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllWorkSchedule = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const data = await workScheduleService.getAllWorkSchedule(
      Number(page),
      Number(size),
      search,
      moment(startDate),
      moment(endDate),
      is_active
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkSchedule,
  findWorkScheduleById,
  updateWorkSchedule,
  deleteWorkSchedule,
  getAllWorkSchedule,
};
