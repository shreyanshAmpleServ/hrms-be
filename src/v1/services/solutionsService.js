const solutionsModel = require('../models/solutionsModel');

const createSolutions = async (data) => {
  return await solutionsModel.createSolutions(data);
};

const findSolutionById = async (id) => {
  return await solutionsModel.findSolutionById(id);
};

const updateSolutions = async (id, data) => {
  return await solutionsModel.updateSolutions(id, data);
};

const deleteSolution = async (id) => {
  return await solutionsModel.deleteSolution(id);
};

const getAllSolution = async (search ,page , size ,startDate,endDate) => {
  return await solutionsModel.getAllSolution(search ,page , size, startDate, endDate);
};


module.exports = {
  createSolutions,
  findSolutionById,
  updateSolutions,
  deleteSolution,
  getAllSolution,
};
