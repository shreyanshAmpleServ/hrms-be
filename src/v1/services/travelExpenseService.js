const travelExpenseModel = require("../models/travelExpenseModel.js");
const createTravelExpense = async (data) => {
  return await travelExpenseModel.createTravelExpense(data);
};

const findTravelExpenseById = async (id, tenantDb = null) => {
  return await travelExpenseModel.findTravelExpenseById(id, tenantDb);
};

const updateTravelExpense = async (id, data) => {
  return await travelExpenseModel.updateTravelExpense(id, data);
};

const deleteTravelExpense = async (id, tenantDb = null) => {
  return await travelExpenseModel.deleteTravelExpense(id, tenantDb);
};

const getAllTravelExpense = async (
  search,
  page,
  size,
  startDate,
  endDate,
  tenantDb = null
) => {
  return await travelExpenseModel.getAllTravelExpense(
    search,
    page,
    size,
    startDate,
    endDate,
    tenantDb
  );
};

const updateTravelExpenseStatus = async (id, data) => {
  return await travelExpenseModel.updateTravelExpenseStatus(id, data);
};

module.exports = {
  createTravelExpense,
  findTravelExpenseById,
  updateTravelExpense,
  deleteTravelExpense,
  getAllTravelExpense,
  updateTravelExpenseStatus,
};
