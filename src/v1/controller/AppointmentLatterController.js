const AppointmentLatterService = require("../services/AppointmentLatterService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createAppointmentLatter = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.employee_id,
      log_inst: req.user.log_inst,
    };
    const reqData = await AppointmentLatterService.createAppointmentLatter(
      data
    );
    res.status(201).success("Appointment latter created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findAppointmentLatterById = async (req, res, next) => {
  try {
    const reqData = await AppointmentLatterService.findAppointmentLatterById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Appointment latter not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateAppointmentLatter = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.employee_id,
      log_inst: req.user.log_inst,
    };
    const reqData = await AppointmentLatterService.updateAppointmentLatter(
      req.params.id,
      data
    );
    res.status(200).success("Appointment latter updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteAppointmentLatter = async (req, res, next) => {
  try {
    await AppointmentLatterService.deleteAppointmentLatter(req.params.id);
    res.status(200).success("Appointment latter deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllAppointmentLatter = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, candidate_id } = req.query;
    const data = await AppointmentLatterService.getAllAppointmentLatter(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      candidate_id ? parseInt(candidate_id) : null
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointmentLatter,
  findAppointmentLatterById,
  updateAppointmentLatter,
  deleteAppointmentLatter,
  getAllAppointmentLatter,
};
