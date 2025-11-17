const branchService = require("../services/branchService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createBranch = async (req, res, next) => {
  try {
    const branch = await branchService.createBranch(req.body);
    res.status(201).success("branch created successfully", branch);
  } catch (error) {
    next(error);
  }
};

const getBranchById = async (req, res, next) => {
  try {
    const branch = await branchService.findBranchById(req.params.id);
    if (!branch) throw new CustomError("branch not found", 404);
    res.status(200).success(null, branch);
  } catch (error) {
    next(error);
  }
};

const updateBranch = async (req, res, next) => {
  try {
    const branch = await branchService.updateBranch(req.params.id, req.body);
    res.status(200).success("branch updated successfully", branch);
  } catch (error) {
    next(error);
  }
};

const deleteBranch = async (req, res, next) => {
  try {
    await branchService.deleteBranch(req.params.id);
    res.status(200).success("branch deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllBranch = async (req, res, next) => {
  try {
    console.log("Query received:", req.query); // 👈 add this

    const { page, size, search, startDate, endDate, is_active } = req.query;
    const branchs = await branchService.getAllBranch(
      Number(page),
      Number(size),
      search,
      startDate && moment(startDate),
      endDate && moment(endDate),
      is_active
    );
    res.status(200).success(null, branchs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBranch,
  getBranchById,
  updateBranch,
  deleteBranch,
  getAllBranch,
};
