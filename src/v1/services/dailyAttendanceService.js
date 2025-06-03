const dailyAttendanceModel = require("../models/dailyAttendanceModel.js");

const createDailyAttendance = async (data) => {
  return await dailyAttendanceModel.createDailyAttendance(data);
};

const findDailyAttendanceById = async (id) => {
  return await dailyAttendanceModel.findDailyAttendanceById(id);
};

const updateDailyAttendance = async (id, data) => {
  return await dailyAttendanceModel.updateDailyAttendance(id, data);
};

const deleteDailyAttendance = async (id) => {
  return await dailyAttendanceModel.deleteDailyAttendance(id);
};

const getAllDailyAttendance = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await dailyAttendanceModel.getAllDailyAttendance(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createDailyAttendance,
  findDailyAttendanceById,
  updateDailyAttendance,
  deleteDailyAttendance,
  getAllDailyAttendance,
};
