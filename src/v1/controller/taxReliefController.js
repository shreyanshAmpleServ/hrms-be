const taxReliefService = require("../services/taxReliefService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createTaxRelief = async (req, res, next) => {
  try {
    let reqData = { ...req.body };
    const data = await taxReliefService.createTaxRelief(reqData);
    res.status(201).success("Tax relief created successfully", data);
  } catch (error) {
    next(error);
  }
};

const findTaxReliefById = async (req, res, next) => {
  try {
    const data = await taxReliefService.findTaxReliefById(req.params.id);
    if (!data) throw new CustomError("Tax relief not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateTaxRelief = async (req, res, next) => {
  try {
    let reqData = { ...req.body };

    const data = await taxReliefService.updateTaxRelief(req.params.id, reqData);
    res.status(200).success("Tax relief updated successfully", data);
  } catch (error) {
    next(error);
  }
};

const deleteTaxRelief = async (req, res, next) => {
  try {
    await taxReliefService.deleteTaxRelief(req.params.id);
    res.status(200).success("Tax relief deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllTaxRelief = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const data = await taxReliefService.getAllTaxRelief(
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
  createTaxRelief,
  findTaxReliefById,
  updateTaxRelief,
  deleteTaxRelief,
  getAllTaxRelief,
};
