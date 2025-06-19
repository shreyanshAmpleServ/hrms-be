const {
  getLeaveBalanceByEmployee,
  updateLeaveBalance,
  deleteLeaveBalance,
  getAllLeaveBalances,
  createLeaveBalance,
} = require("../models/leaveBalanceModel");
const CustomError = require("../../utils/CustomError");

/**
 * Controller for creating leave balance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const createLeaveBalanceController = async (req, res, next) => {
  try {
    const { employee_id, employee_code, first_name, last_name } = req.body;
    if (!employee_id || !employee_code || !first_name || !last_name) {
      throw new CustomError("All fields are required", 400);
    }
    const result = await createLeaveBalance(
      employee_id,
      employee_code,
      first_name,
      last_name
    );
    res.status(200).success("Leave balance created successfully", result.data);
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
    const { id } = req.query;
    const { employeeId, leaveTypeId, leaveBalance, leaveBalanceDate } =
      req.body;
    if (!id) {
      throw new CustomError("ID is required", 400);
    }
    const result = await updateLeaveBalance(
      id,
      employeeId,
      leaveTypeId,
      leaveBalance,
      leaveBalanceDate
    );
    res.status(200).success("Leave balance updated successfully", result.data);
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
    const { id } = req.params;
    if (!id) {
      throw new CustomError("ID is required", 400);
    }
    await deleteLeaveBalance(id);
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
    const { page, size, search } = req.query;
    const result = await getAllLeaveBalances(search, page, size);
    res
      .status(200)
      .success("Leave balances retrieved successfully", result.data);
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
    res
      .status(200)
      .success("Leave balance retrieved successfully", result.data);
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
};
