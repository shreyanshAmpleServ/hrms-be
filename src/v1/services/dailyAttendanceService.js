const { verify } = require("jsonwebtoken");
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
  }

  return await dailyAttendanceModel.findAttendanceByEmployeeId(
    employeeId,
    startDate,
    endDate
  );
};
const getManagerEmployees = async (manager_id, search, page, size) => {
  return await dailyAttendanceModel.getManagerEmployees(
    manager_id,
    search,
    page,
    size
  );
};

const getManagerTeamAttendance = async (
  manager_id,
  search,
  page,
  size,
  startDate,
  endDate,
  employee_id
) => {
  return await dailyAttendanceModel.getManagerTeamAttendance(
    manager_id,
    search,
    page,
    size,
    startDate,
    endDate,
    employee_id
  );
};

const getAllHRUsers = async () => {
  return await dailyAttendanceModel.getAllHRUsers();
};

const verifyAttendanceByManager = async (
  manager_id,
  attendanceId,
  verificationStatus,
  remarks
) => {
  return await dailyAttendanceModel.verifyAttendanceByManager(
    manager_id,
    attendanceId,
    verificationStatus,
    remarks
  );
};

const verifyAttendanceWithManualHR = async (
  manager_id,
  attendanceId,
  verificationStatus,
  remarks,
  logInst,
  selectedHRUserId,
  notifyHR
) => {
  return await dailyAttendanceModel.verifyAttendanceWithManualHR(
    manager_id,
    attendanceId,
    verificationStatus,
    remarks,
    logInst,
    selectedHRUserId,
    notifyHR
  );
};

const bulkVerifyWithManualHR = async (
  manager_id,
  verificationStatus = "A",
  remarks = "Bulk verification by manager",
  logInst = 1,
  notifyHR = true
) => {
  return await dailyAttendanceModel.bulkVerifyWithManualHR(
    manager_id,
    verificationStatus,
    remarks,
    logInst,
    notifyHR
  );
};

const getAllManagersWithVerifications = async () => {
  return await dailyAttendanceModel.getAllManagersWithVerifications();
};

const getVerificationStatusForHR = async (
  search,
  page,
  size,
  startDate,
  endDate,
  verificationStatus,
  manager_id
) => {
  return await dailyAttendanceModel.getVerificationStatusForHR(
    search,
    page,
    size,
    startDate,
    endDate,
    verificationStatus,
    manager_id
  );
};
const getVerificationSummary = async (startDate, endDate, manager_id) => {
  return await dailyAttendanceModel.getVerificationSummary(
    startDate,
    endDate,
    manager_id
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

  getManagerEmployees,
  getManagerTeamAttendance,
  getAllHRUsers,

  verifyAttendanceByManager,
  verifyAttendanceWithManualHR,

  bulkVerifyWithManualHR,
  getAllManagersWithVerifications,
  getVerificationStatusForHR,
  getVerificationSummary,
};
