const salaryStructureService = require("../services/salaryStructureService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createSalaryStructure = async (req, res, next) => {
  try {
    let salaryData = { ...req.body };
    const salaryStructure = await salaryStructureService.createSalaryStructure(
      salaryData
    );
    res
      .status(201)
      .success("Salary structure created successfully", salaryStructure);
  } catch (error) {
    next(error);
  }
};

const findSalaryStructureById = async (req, res, next) => {
  try {
    const salaryStructure =
      await salaryStructureService.findSalaryStructureById(req.params.id);
    if (!salaryStructure)
      throw new CustomError("Salary structure not found", 404);

    res.status(200).success(null, salaryStructure);
  } catch (error) {
    next(error);
  }
};

const updateSalaryStructure = async (req, res, next) => {
  try {
    // const attachmentPath = req.file ? req.file.path : null;
    let salaryData = { ...req.body };
    // if (attachmentPath) salaryData.attachment = generateFullUrl(req, attachmentPath);

    // salaryData = sanitizesalaryData(salaryData);

    const salaryStructure = await salaryStructureService.updateSalaryStructure(
      req.params.id,
      salaryData
    );
    res
      .status(200)
      .success("Salary structure updated successfully", salaryStructure);
  } catch (error) {
    next(error);
  }
};

const deleteSalaryStructure = async (req, res, next) => {
  try {
    await salaryStructureService.deleteSalaryStructure(req.params.id);
    res.status(200).success("Salary structure deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllSalaryStructure = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const salaryStructures = await salaryStructureService.getAllSalaryStructure(
      Number(page),
      Number(size),
      search,
      moment(startDate),
      moment(endDate),
      is_active
    );
    res.status(200).success(null, salaryStructures);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSalaryStructure,
  findSalaryStructureById,
  updateSalaryStructure,
  deleteSalaryStructure,
  getAllSalaryStructure,
};
