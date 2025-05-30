const assetAssignmentService = require("../services/assetAssignmentService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createAssetAssignment = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await assetAssignmentService.createAssetAssignment(data);
    res.status(201).success("Asset assignment created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findAssetAssignment = async (req, res, next) => {
  try {
    const reqData = await assetAssignmentService.findAssetAssignmentById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Asset assignment not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateAssetAssignment = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await assetAssignmentService.updateAssetAssignment(
      req.params.id,
      data
    );
    res.status(200).success("Asset assignment updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteAssetAssignment = async (req, res, next) => {
  try {
    await assetAssignmentService.deleteAssetAssignment(req.params.id);
    res.status(200).success("Asset assignment deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllAssetAssignments = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await assetAssignmentService.getAllAssetAssignment(
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
  createAssetAssignment,
  findAssetAssignment,
  updateAssetAssignment,
  deleteAssetAssignment,
  getAllAssetAssignments,
};
