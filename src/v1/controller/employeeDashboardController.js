const employeeDashboardService = require("../services/employeeDashboardService.js");
const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");
const { success } = require("zod/v4");

const getEmployeeDashboardData = async (req, res, next) => {
  try {
    const getAllData = await employeeDashboardService.getEmployeeDashboardData(
      req.query.filterDays
    );
    res.status(200).success(null, getAllData);
  } catch (error) {
    next(error);
  }
};

const getEmployeeLeavesData = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    const data = await employeeDashboardService.getEmployeeLeavesData(
      employeeId
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const getEmployeeAttendanceSummary = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    const data = await employeeDashboardService.getEmployeeAttendanceSummary(
      employeeId
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const getEmployeeDetails = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    const data = await employeeDashboardService.getEmployeeDetails(employeeId);
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const getAllUpcomingBirthdays = async (req, res, next) => {
  try {
    const designationData =
      await employeeDashboardService.getAllUpcomingBirthdays();

    res
      .status(200)
      .success("Today Birthdays fetched successfully", designationData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployeeDashboardData,
  getEmployeeLeavesData,
  getEmployeeAttendanceSummary,
  getEmployeeDetails,
  getAllUpcomingBirthdays,
};
