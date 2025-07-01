const employeeDashboardModel = require("../controller/employeeDashboardModel.js");

const getEmployeeDashboardData = async (filterDays) => {
  return await employeeDashboardModel.getEmployeeDashboardData(filterDays);
};

const getEmployeeLeavesData = async (employeeId) => {
  return await employeeDashboardModel.getEmployeeLeavesData(employeeId);
};

const getEmployeeAttendanceSummary = async (employeeId) => {
  return await employeeDashboardModel.getEmployeeAttendanceSummary(employeeId);
};
module.exports = {
  getEmployeeDashboardData,
  getEmployeeLeavesData,
  getEmployeeAttendanceSummary,
};
