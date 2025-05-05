const dashboardModel = require('../models/dashboardModel');

const findDealById = async (id) => {
  return await dashboardModel.findDealById(id);
};
const getDashboardData = async (filterDays) => {
  return await dashboardModel.getDashboardData(filterDays);
};

module.exports = {
  findDealById,
  getDashboardData,
};
