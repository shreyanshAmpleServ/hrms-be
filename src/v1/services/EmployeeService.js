// const employeeModel = require("../models/EmployeeModel");

// const createEmployee = async (data) => {
//   return await employeeModel.createEmployee(data);
// };

// const findEmployeeById = async (id) => {
//   return await employeeModel.findEmployeeById(id);
// };

// const updateEmployee = async (id, data) => {
//   return await employeeModel.updateEmployee(id, data);
// };

// const deleteEmployee = async (id) => {
//   return await employeeModel.deleteEmployee(id);
// };

// const getAllEmployee = async (
//   page,
//   size,
//   search,
//   startDate,
//   endDate,
//   status,
//   priority
// ) => {
//   return await employeeModel.getAllEmployee(
//     page,
//     size,
//     search,
//     startDate,
//     endDate,
//     status,
//     priority
//   );
// };

// const employeeOptions = async () => {
//   return await employeeModel.employeeOptions();
// };

// module.exports = {
//   createEmployee,
//   findEmployeeById,
//   updateEmployee,
//   getAllEmployee,
//   deleteEmployee,
//   employeeOptions,
// };

const employeeModel = require("../models/EmployeeModel");

const createEmployee = async (data) => {
  return await employeeModel.createEmployee(data);
};

const findEmployeeById = async (id) => {
  return await employeeModel.findEmployeeById(id);
};

const updateEmployee = async (id, data) => {
  return await employeeModel.updateEmployee(id, data);
};

const deleteEmployee = async (id) => {
  return await employeeModel.deleteEmployee(id);
};

const getAllEmployee = async (
  page,
  size,
  search,
  startDate,
  endDate,
  status
) => {
  return await employeeModel.getAllEmployee(
    page,
    size,
    search,
    startDate,
    endDate,
    status
  );
};

const employeeOptions = async () => {
  return await employeeModel.employeeOptions();
};

module.exports = {
  createEmployee,
  findEmployeeById,
  updateEmployee,
  getAllEmployee,
  deleteEmployee,
  employeeOptions,
};
