const taxRegimService = require("../services/taxRegimService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createTaxRegime = async (req, res, next) => {
  try {
    let taxData = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const data = await taxRegimService.createTaxRegime(taxData);
    res.status(201).success("Tax regime created successfully", data);
  } catch (error) {
    next(error);
  }
};

const findTaxRegimeById = async (req, res, next) => {
  try {
    const data = await taxRegimService.findTaxRegimeById(req.params.id);
    if (!data) throw new CustomError("Tax regime not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateTaxRegime = async (req, res, next) => {
  try {
    let taxData = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const data = await taxRegimService.updateTaxRegime(req.params.id, taxData);
    res.status(200).success("Tax regime updated successfully", data);
  } catch (error) {
    next(error);
  }
};

const deleteTaxRegime = async (req, res, next) => {
  try {
    await taxRegimService.deleteTaxRegime(req.params.id);
    res.status(200).success("Tax regime deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllTaxRegime = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await taxRegimService.getAllTaxRegime(
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
  createTaxRegime,
  findTaxRegimeById,
  updateTaxRegime,
  deleteTaxRegime,
  getAllTaxRegime,
};
