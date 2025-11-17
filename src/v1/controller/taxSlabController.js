const taxSlabService = require("../services/taxSlabService");
const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

const createTaxSlab = async (req, res, next) => {
  try {
    let userData = { ...req.body, createdby: req.user.id };
    const tax = await taxSlabService.createTaxSlab(userData);
    res.status(201).success("tax slab created successfully", tax);
  } catch (error) {
    next(error);
  }
};

const findTaxSlabById = async (req, res, next) => {
  try {
    const result = await taxSlabService.getAllTaxSlab(
      null,
      null,
      null,
      null,
      null,
      null,
      req.params.id
    );
    if (!result.data) throw new CustomError("tax slab not found", 404);
    res.status(200).success(null, result.data);
  } catch (error) {
    next(error);
  }
};

const updateTaxSlab = async (req, res, next) => {
  try {
    const taxData = { ...req.body, updatedby: req.user.id };
    const tax = await taxSlabService.updateTaxSlab(req.params.id, taxData);
    res.status(200).success("tax slab updated successfully", tax);
  } catch (error) {
    next(error);
  }
};

const deleteTaxSlab = async (req, res, next) => {
  try {
    await taxSlabService.deleteTaxSlab(req.params.id);
    res.status(200).success("tax slab deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllTaxSlab = async (req, res, next) => {
  try {
    const { search, page, size, startDate, endDate, is_active, id } = req.query;

    const taxs = await taxSlabService.getAllTaxSlab(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      is_active,
      id || req.params.id
    );
    res.status(200).success(null, taxs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTaxSlab,
  findTaxSlabById,
  updateTaxSlab,
  deleteTaxSlab,
  getAllTaxSlab,
};
