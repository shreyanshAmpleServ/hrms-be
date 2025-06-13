const dashboardModel = require("../models/dashboardModel");

const findDealById = async (id) => {
  return await dashboardModel.findDealById(id);
};
const getDashboardData = async (filterDays) => {
  return await dashboardModel.getDashboardData(filterDays);
};

const getAllEmployeeAttendance = async (startDate, endDate) => {
  return await dashboardModel.getAllEmployeeAttendance(startDate, endDate);
};

module.exports = {
  findDealById,
  getDashboardData,
};
