const assetsTypeService = require("../services/assetsTypeService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createAssetsType = async (req, res, next) => {
  try {
    let reqData = { ...req.body };
    const data = await assetsTypeService.createAssetsType(reqData);
    res.status(201).success("Assets type created successfully", data);
  } catch (error) {
    next(error);
  }
};

const findAssetsTypeById = async (req, res, next) => {
  try {
    const data = await assetsTypeService.findAssetsTypeById(req.params.id);
    if (!data) throw new CustomError("Assets type not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateAssetsType = async (req, res, next) => {
  try {
    let reqData = { ...req.body };

    const data = await assetsTypeService.updateAssetsType(
      req.params.id,
      reqData
    );
    res.status(200).success("Assets type updated successfully", data);
  } catch (error) {
    next(error);
  }
};

const deleteAssetsType = async (req, res, next) => {
  try {
    await assetsTypeService.deleteAssetsType(req.params.id);
    res.status(200).success("Assets type deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllAssetsType = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const data = await assetsTypeService.getAllAssetsType(
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
  createAssetsType,
  findAssetsTypeById,
  updateAssetsType,
  deleteAssetsType,
  getAllAssetsType,
};
