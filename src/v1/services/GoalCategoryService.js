const GoalCategoryModel = require("../models/GoalCategoryModel");
const { getPrisma } = require("../../config/prismaContext.js");

const createGoalCategory = async (data) => {
  return await GoalCategoryModel.createGoalCategory(data);
};

const findGoalCategoryById = async (id) => {
  return await GoalCategoryModel.findGoalCategoryById(id);
};

const updateGoalCategory = async (id, data) => {
  return await GoalCategoryModel.updateGoalCategory(id, data);
};

const deleteGoalCategory = async (id) => {
  return await GoalCategoryModel.deleteGoalCategory(id);
};

const getAllGoalCategory = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await GoalCategoryModel.getAllGoalCategory(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createGoalCategory,
  findGoalCategoryById,
  updateGoalCategory,
  deleteGoalCategory,
  getAllGoalCategory,
};
