const travelExpenseModel = require("../models/travelExpenseModel.js");
const createTravelExpense = async (data) => {
  return await travelExpenseModel.createTravelExpense(data);
};

const findTravelExpenseById = async (id) => {
  return await travelExpenseModel.findTravelExpenseById(id);
};

const updateTravelExpense = async (id, data) => {
  return await travelExpenseModel.updateTravelExpense(id, data);
};

const deleteTravelExpense = async (id) => {
  return await travelExpenseModel.deleteTravelExpense(id);
};

const getAllTravelExpense = async (search, page, size, startDate, endDate) => {
  return await travelExpenseModel.getAllTravelExpense(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createTravelExpense,
  findTravelExpenseById,
  updateTravelExpense,
  deleteTravelExpense,
  getAllTravelExpense,
};
