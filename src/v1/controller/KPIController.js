const KPIService = require("../services/KPIService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createKPI = async (req, res, next) => {
  try {
    let reqData = { ...req.body };
    const data = await KPIService.createKPI(reqData);
    res.status(201).success("KPI created successfully", data);
  } catch (error) {
    next(error);
  }
};

const findKPIById = async (req, res, next) => {
  try {
    const data = await KPIService.findKPIById(req.params.id);
    if (!data) throw new CustomError("KPI not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateKPI = async (req, res, next) => {
  try {
    let reqData = { ...req.body };

    const data = await KPIService.updateKPI(req.params.id, reqData);
    res.status(200).success("KPI updated successfully", data);
  } catch (error) {
    next(error);
  }
};

const deleteKPI = async (req, res, next) => {
  try {
    await KPIService.deleteKPI(req.params.id);
    res.status(200).success("KPI deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllKPI = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const data = await KPIService.getAllKPI(
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
  createKPI,
  findKPIById,
  updateKPI,
  deleteKPI,
  getAllKPI,
};
