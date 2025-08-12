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

const getAttendanceSummaryByEmployee = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await dailyAttendanceModel.getAttendanceSummaryByEmployee(
    search,
    page,
    size,
    startDate,
    endDate
  );
};
const upsertDailyAttendance = async (id, data) => {
  return await dailyAttendanceModel.upsertDailyAttendance(id, data);
};

const findAttendanceByEmployeeId = async (employeeId, startDate, endDate) => {
  if (!startDate || !endDate) {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");

    startDate = `${year}-${month}-01`;

    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    endDate = `${year}-${month}-${lastDay.toString().padStart(2, "0")}`;

    console.log(`Default date range: ${startDate} to ${endDate}`);
    console.log(`Default is the current month: ${startDate} to ${endDate}`);
    console.error(`${error}`);
  }

  return await dailyAttendanceModel.findAttendanceByEmployeeId(
    employeeId,
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
  getAttendanceSummaryByEmployee,
  findAttendanceByEmployeeId,
  upsertDailyAttendance,
};
