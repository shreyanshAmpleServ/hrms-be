const disciplinaryPenaltyService = require("../services/disciplinaryPenaltyService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createDisciplinaryPenalty = async (req, res, next) => {
  try {
    let reqData = { ...req.body };
    const data = await disciplinaryPenaltyService.createDisciplinaryPenalty(
      reqData
    );
    res.status(201).success("Disciplinary penalty created successfully", data);
  } catch (error) {
    next(error);
  }
};

const findDisciplinaryPenaltyById = async (req, res, next) => {
  try {
    const data = await disciplinaryPenaltyService.findDisciplinaryPenaltyById(
      req.params.id
    );
    if (!data) throw new CustomError("Disciplinary penalty not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateDisciplinaryPenalty = async (req, res, next) => {
  try {
    let reqData = { ...req.body };

    const data = await disciplinaryPenaltyService.updateDisciplinaryPenalty(
      req.params.id,
      reqData
    );
    res.status(200).success("Disciplinary penalty updated successfully", data);
  } catch (error) {
    next(error);
  }
};

const deleteDisciplinaryPenalty = async (req, res, next) => {
  try {
    await disciplinaryPenaltyService.deleteDisciplinaryPenalty(req.params.id);
    res.status(200).success("Disciplinary penalty deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllDisciplinaryPenalty = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const data = await disciplinaryPenaltyService.getAllDisciplinaryPenalty(
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
  createDisciplinaryPenalty,
  findDisciplinaryPenaltyById,
  updateDisciplinaryPenalty,
  deleteDisciplinaryPenalty,
  getAllDisciplinaryPenalty,
};
