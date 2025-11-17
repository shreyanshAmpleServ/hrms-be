const employeeDashboardModel = require("../controller/employeeDashboardModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const getEmployeeDashboardData = async (filterDays) => {
  return await employeeDashboardModel.getEmployeeDashboardData(filterDays);
};

const getEmployeeLeavesData = async (employeeId) => {
  return await employeeDashboardModel.getEmployeeLeavesData(employeeId);
};

const getEmployeeAttendanceSummary = async (employeeId) => {
  return await employeeDashboardModel.getEmployeeAttendanceSummary(employeeId);
};

const getEmployeeDetails = async (employeeId) => {
  const employee = await employeeDashboardModel.getEmployeeDetails(employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }

  return {
    id: employee.id,
    full_name: employee.full_name,
    phone_number: employee.phone_number,
    employee_code: employee.employee_code,
    email: employee.email,
    date_of_birth: employee.date_of_birth,
    gender: employee.gender,
    email: employee.email,
    join_date: employee.join_date,
    profile_pic: employee.profile_pic,
    designation:
      employee.hrms_employee_designation?.designation_name || "Not Assigned",
    department:
      employee.hrms_employee_department?.department_name || "Not Assigned",
  };
};

const getAllUpcomingBirthdays = async () => {
  return await employeeDashboardModel.getAllUpcomingBirthdays();
};

module.exports = {
  getEmployeeDashboardData,
  getEmployeeLeavesData,
  getEmployeeAttendanceSummary,
  getEmployeeDetails,
  getAllUpcomingBirthdays,
};
