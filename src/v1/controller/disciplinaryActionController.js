const disciplinaryActionService = require("../services/disciplinaryActionService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");

// Controller on create a new disciplinary action
const createDisciplinaryAction = async (req, res, next) => {
  try {
    const data = { ...req.body, createdby: req.user.id };
    const result = await disciplinaryActionService.createDisciplinaryAction(
      data
    );
    res.status(201).json(result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Controler on get a disciplinary action by ID
const getDisciplinaryActionById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await disciplinaryActionService.getDisciplinaryActionById(
      id
    );
    res.status(200).json(result);
  } catch (error) {
    next(new CustomError(error.message, 404));
  }
};

// Controler on update a disciplinary action
const updateDisciplinaryAction = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = { ...req.body, updatedby: req.user.id };
    const result = await disciplinaryActionService.updateDisciplinaryAction(
      id,
      data
    );
    res.status(200).json(result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Controller on delete a disciplinary action
const deleteDisciplinaryAction = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await disciplinaryActionService.deleteDisciplinaryAction(id);
    res.status(200).json(result);
  } catch (error) {
    next(new CustomError(error.message, 404));
  }
};

// Controller on get all disciplinary actions
const getAllDisciplinaryActions = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await disciplinaryActionService.getAllDisciplinaryActions(
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
  createDisciplinaryAction,
  getDisciplinaryActionById,
  updateDisciplinaryAction,
  deleteDisciplinaryAction,
  getAllDisciplinaryActions,
};
