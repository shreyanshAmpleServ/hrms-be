const goalSheetModel = require("../models/goalSheetModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createGoalSheet = async (data) => {
  return await goalSheetModel.createGoalSheet(data);
};

const findGoalSheetById = async (id) => {
  return await goalSheetModel.findGoalSheetById(id);
};

const updateGoalSheet = async (id, data) => {
  return await goalSheetModel.updateGoalSheet(id, data);
};

const deleteGoalSheet = async (id) => {
  return await goalSheetModel.deleteGoalSheet(id);
};

const getAllGoalSheet = async (search, page, size, startDate, endDate) => {
  return await goalSheetModel.getAllGoalSheet(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

const updateGoalSheetStatus = async (id, data) => {
  return await goalSheetModel.updateGoalSheetStatus(id, data);
};
module.exports = {
  createGoalSheet,
  findGoalSheetById,
  updateGoalSheet,
  deleteGoalSheet,
  getAllGoalSheet,
  updateGoalSheetStatus,
};
