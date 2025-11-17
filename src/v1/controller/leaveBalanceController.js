const {
  getLeaveBalanceByEmployee,
  updateLeaveBalance,
  deleteLeaveBalance,
  getAllLeaveBalances,
  createLeaveBalance,
  findLeaveBalanceById,
  findLeaveBalanceByEmployeeId,
} = require("../models/leaveBalanceModel");
const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

/**
 * Controller for creating leave balance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const createLeaveBalanceController = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.employee_id,
      log_inst: req.user.log_inst,
    };
    const result = await createLeaveBalance(data);
    res.status(200).success("Leave balance created successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for updating leave balance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateLeaveBalanceController = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.employee_id,
      log_inst: req.user.log_inst,
    };
    const result = await updateLeaveBalance(req.params.id, data);
    res.status(200).success("Leave balance updated successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for deleting leave balance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteLeaveBalanceController = async (req, res, next) => {
  try {
    await deleteLeaveBalance(req.params.id);
    res.status(200).success("Leave balance deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for getting all leave balances
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getAllLeaveBalancesController = async (req, res, next) => {
  try {
    const { page, size, search, is_active } = req.query;
    const result = await getAllLeaveBalances(search, page, size, is_active);
    res.status(200).success(null, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for getting all leave balances
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const findLeaveBalanceByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await findLeaveBalanceById(id);
    res.status(200).success("Leave balances retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for getting leave balance by employee ID and leave type ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getLeaveBalanceController = async (req, res, next) => {
  try {
    const { employeeId, leaveTypeId } = req.query;
    if (!employeeId) {
      throw new CustomError("Employee ID is required", 400);
    }
    const result = await getLeaveBalanceByEmployee(employeeId, leaveTypeId);
    res.status(200).success("Leave balance retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for getting leave balance by employee ID and leave type ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const findLeaveBalanceByEmployeeIdController = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      throw new CustomError("Employee ID is required", 400);
    }
    const result = await findLeaveBalanceByEmployeeId(employeeId);
    res.status(200).success("Leave balance retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLeaveBalanceController,
  updateLeaveBalanceController,
  deleteLeaveBalanceController,
  getAllLeaveBalancesController,
  getLeaveBalanceController,
  findLeaveBalanceByIdController,
  findLeaveBalanceByEmployeeIdController,
};
