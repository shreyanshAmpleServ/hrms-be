const DocTypeService = require("../services/DocTypeService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createDocType = async (req, res, next) => {
  try {
    let reqData = { ...req.body };
    const data = await DocTypeService.createDocType(reqData);
    res.status(201).success("Document type created successfully", data);
  } catch (error) {
    next(error);
  }
};

const findDocTypeById = async (req, res, next) => {
  try {
    const data = await DocTypeService.findDocTypeById(req.params.id);
    if (!data) throw new CustomError("Document type not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateDocType = async (req, res, next) => {
  try {
    let reqData = { ...req.body };

    const data = await DocTypeService.updateDocType(req.params.id, reqData);
    res.status(200).success("Document type updated successfully", data);
  } catch (error) {
    next(error);
  }
};

const deleteDocType = async (req, res, next) => {
  try {
    await DocTypeService.deleteDocType(req.params.id);
    res.status(200).success("Document type deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllDocType = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const data = await DocTypeService.getAllDocType(
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
  createDocType,
  findDocTypeById,
  updateDocType,
  deleteDocType,
  getAllDocType,
};
