const dashboardService = require("../services/dashboardService");
const CustomError = require("../../utils/CustomError");

const getDealById = async (req, res, next) => {
  try {
    const getData = await dashboardService.findDealById(req.params.id);
    if (!getData) throw new CustomError("Deals not found", 404);
    res.status(200).success(null, getData);
  } catch (error) {
    next(error);
  }
};

const getDashboardData = async (req, res, next) => {
  try {
    const getAllData = await dashboardService.getDashboardData(
      req.query.filterDays
    );
    res.status(200).success(null, getAllData);
  } catch (error) {
    next(error);
  }
};

const getAllEmployeeAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await dashboardService.getAllEmployeeAttendance(
      startDate,
      endDate
    );
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDealById,
  getDashboardData,
  getAllEmployeeAttendance,
};
