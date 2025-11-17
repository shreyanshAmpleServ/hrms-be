const successionPlanService = require("../services/successionPlanService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

// Controller on create a new succession plan
const createSuccessionPlan = async (req, res, next) => {
  try {
    const data = { ...req.body, createdby: req.user.id };
    const result = await successionPlanService.createSuccessionPlan(data);
    res.status(200).success("Succession Plan created successfully", result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Controler on get a succession plan by ID
const getSuccessionPlanById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await successionPlanService.findSuccessionPlanById(id);
    res.status(200).json(result);
  } catch (error) {
    next(new CustomError(error.message, 404));
  }
};

// Controler on update a succession plan
const updateSuccessionPlan = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = { ...req.body, updatedby: req.user.id };
    const result = await successionPlanService.updateSuccessionPlan(id, data);
    res.status(200).success("Succession Plan updated successfully", result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Controller on delete a succession plan
const deleteSuccessionPlan = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await successionPlanService.deleteSuccessionPlan(id);
    res.status(200).success("Succession plan deleted successfully", result);
  } catch (error) {
    next(new CustomError(error.message, 404));
  }
};

// Controller on get all succession plans
const getAllSuccessionPlan = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await successionPlanService.getAllSuccessionPlan(
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
  createSuccessionPlan,
  getSuccessionPlanById,
  updateSuccessionPlan,
  deleteSuccessionPlan,
  getAllSuccessionPlan,
};
