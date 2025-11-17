const designationService = require("../services/designationService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createDesignation = async (req, res, next) => {
  try {
    let designationData = { ...req.body };
    const designation = await designationService.createDesignation(
      designationData
    );
    res.status(201).success("Designation created successfully", designation);
  } catch (error) {
    next(error);
  }
};

const findDesignationById = async (req, res, next) => {
  try {
    const designation = await designationService.findDesignationById(
      req.params.id
    );
    if (!designation) throw new CustomError("Designation not found", 404);

    res.status(200).success(null, designation);
  } catch (error) {
    next(error);
  }
};

const updateDesignation = async (req, res, next) => {
  try {
    let designationData = { ...req.body };
    const designation = await designationService.updateDesignation(
      req.params.id,
      designationData
    );
    res.status(200).success("Designation updated successfully", designation);
  } catch (error) {
    next(error);
  }
};

const deleteDesignation = async (req, res, next) => {
  try {
    await designationService.deleteDesignation(req.params.id);
    res.status(200).success("Designation deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllDesignation = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const designations = await designationService.getAllDesignation(
      Number(page),
      Number(size),
      search,
      moment(startDate),
      moment(endDate),
      is_active
    );
    res.status(200).success(null, designations);
  } catch (error) {
    next(error);
  }
};

const getDesignationOptions = async (req, res, next) => {
  try {
    let { is_active } = req.query;

    if (is_active === undefined || is_active === null || is_active === "") {
      is_active = "true";
    }

    const designations = await designationService.getDesignationOptions(
      is_active
    );
    res.status(200).success(null, designations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDesignation,
  findDesignationById,
  updateDesignation,
  deleteDesignation,
  getAllDesignation,
  getDesignationOptions,
};
