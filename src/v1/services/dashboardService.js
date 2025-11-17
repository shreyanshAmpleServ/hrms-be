const dashboardModel = require("../models/dashboardModel");
const { getPrisma } = require("../../config/prismaContext.js");

const findDealById = async (id) => {
  return await dashboardModel.findDealById(id);
};
const getDashboardData = async (filterDays) => {
  return await dashboardModel.getDashboardData(filterDays);
};

const getAllEmployeeAttendance = async (dateString, managerId) => {
  return await dashboardModel.getAllEmployeeAttendance(dateString, managerId);
};

const getUpcomingBirthdays = async (page, limit) => {
  return await dashboardModel.getUpcomingBirthdays(page, limit);
};

const getAllUpcomingBirthdays = async () => {
  return await dashboardModel.getAllUpcomingBirthdays();
};

const getDesignations = async () => {
  return await dashboardModel.getDesignations();
};

const getAllAbsents = async () => {
  return await dashboardModel.getAllAbsents();
};

const getDepartment = async () => {
  return await dashboardModel.getDepartment();
};

const getStatus = async () => {
  return await dashboardModel.getStatus();
};

const workAnniversary = async (page, limit) => {
  return await dashboardModel.workAnniversary(page, limit);
};

const getEmployeeActivity = async (page, limit) => {
  return await dashboardModel.getEmployeeActivity(page, limit);
};

const attendanceOverview = async () => {
  return await dashboardModel.attendanceOverview();
};

module.exports = {
  findDealById,
  getDashboardData,
  getAllEmployeeAttendance,
  getUpcomingBirthdays,
  getAllUpcomingBirthdays,
  getDesignations,
  getAllAbsents,
  getDepartment,
  getStatus,
  workAnniversary,
  attendanceOverview,
  getEmployeeActivity,
};
