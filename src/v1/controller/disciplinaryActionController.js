const disciplinaryActionService = require("../services/disciplinaryActionService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

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
    res.status(200).success("Disciplinary Action deleted successfully", result);
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

const updateDisciplinaryActionStatus = async (req, res, next) => {
  try {
    console.log("Approver ID from token:", req.user.id);

    const status = req.body.status;
    const rejection_reason = req.body.rejection_reason || "";
    console.log("User : ", req.user);
    const data = {
      status,
      updatedby: req.user.employee_id,
      reviewed_by: req.user.employee_id,
      updatedate: new Date(),
    };

    const reqData =
      await disciplinaryActionService.updateDisciplinaryActionStatus(
        req.params.id,
        data
      );
    res
      .status(200)
      .success("Disciplinary Action status updated successfully", reqData);
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
  updateDisciplinaryActionStatus,
};
