const dashboardService = require("../services/dashboardService");
const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");
const { success } = require("zod/v4");

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

// const getAllEmployeeAttendance = async (req, res, next) => {
//   try {
//     const managerId = req.user.employee_id;
//     const { startDate, endDate } = req.query;

//     const attendanceData = await dashboardService.getAllEmployeeAttendance(
//       startDate,
//       endDate
//     );

//     res
//       .status(200)
//       .success("Attendance data fetched successfully", attendanceData);
//   } catch (error) {
//     next(error);
//   }
// };

const getAllEmployeeAttendance = async (req, res, next) => {
  try {
    const managerId = req.user?.employee_id;
    const { date } = req.query;

    const attendanceData = await dashboardService.getAllEmployeeAttendance(
      date,
      managerId
    );

    res.status(200).json({
      success: true,
      data: attendanceData,
      message: "Attendance data fetched successfully",
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};
const getUpcomingBirthdays = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const birthdayData = await dashboardService.getUpcomingBirthdays(
      page,
      size
    );

    res.status(200).success("Birthday fetched successfully", birthdayData);
  } catch (error) {
    next(error);
  }
};

const getDesignations = async (req, res, next) => {
  try {
    const designationData = await dashboardService.getDesignations();
    res
      .status(200)
      .success("Designations fetched successfully", designationData);
  } catch (error) {
    next(error);
  }
};

const getAllUpcomingBirthdays = async (req, res, next) => {
  try {
    const designationData = await dashboardService.getAllUpcomingBirthdays();

    res
      .status(200)
      .success("Today Birthdays fetched successfully", designationData);
  } catch (error) {
    next(error);
  }
};

const getAllAbsents = async (req, res, next) => {
  try {
    const data = await dashboardService.getAllAbsents();
    res.status(200).success("Todays absentee's fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

const getDepartment = async (req, res, next) => {
  try {
    const data = await dashboardService.getDepartment();
    res.status(200).success("Depatemnts fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const data = await dashboardService.getStatus();
    res.status(200).success("Employee's status fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

const workAnniversary = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const data = await dashboardService.workAnniversary(page, size);
    res.status(200).success("Work anniversary fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

const attendanceOverview = async (req, res, next) => {
  try {
    const data = await dashboardService.attendanceOverview();
    res.status(200).success("Attendance Overview fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

const getEmployeeActivity = async (req, res, next) => {
  try {
    const data = await dashboardService.getEmployeeActivity();
    res.status(200).success("Employee activity fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDealById,
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
