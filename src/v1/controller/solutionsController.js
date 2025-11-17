const solutionsService = require('../services/solutionsService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const sanitizeSolutionData = (data) => {
  return {
        ...data,
        product_id: Number(data?.product_id) || null,
        solution_owner: data.solution_owner ? Number(data.solution_owner) : null,
        is_active: data.is_active || "Y",
        log_inst: data.log_inst || 1,
  };
};

const createSolutions = async (req, res, next) => {
  try {
    let SolutionData = { ...req.body };
    SolutionData = sanitizeSolutionData( SolutionData); // Sanitize the solutions data and handle company icon

    const solutions = await solutionsService.createSolutions({...SolutionData,createdby:Number(req.user.id)});
    res.status(201).success('solution created successfully', solutions);
  } catch (error) {
    next(error);
  }
};

const findSolutionById = async (req, res, next) => {
  try {
    const solutions = await solutionsService.findSolutionById(req.params.id);
    if (!solutions) throw new CustomError('solution not found', 404);
    res.status(200).success(null, solutions);
  } catch (error) {
    next(error);
  }
};

const updateSolutions = async (req, res, next) => {
  try {

    const { id, ...datas } = req.body
    SolutionData = sanitizeSolutionData(datas); // Sanitize the solutions data and handle company icon

    const solutions = await solutionsService.updateSolutions(req.params.id, {...SolutionData,updatedby:req.user.id});
    res.status(200).success('solution updated successfully', solutions);
  } catch (error) {
    next(error);
  }
};

const deleteSolution = async (req, res, next) => {
  try {
    await solutionsService.deleteSolution(req.params.id);
    res.status(200).success('solution deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const getAllSolution = async (req, res, next) => {
  try {
    const { page , size , search ,startDate,endDate  } = req.query;
    const solutions = await solutionsService.getAllSolution(search ,Number(page), Number(size) ,moment(startDate),moment(endDate));
    res.status(200).success(null, solutions);
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createSolutions,
  findSolutionById,
  updateSolutions,
  deleteSolution,
  getAllSolution,
};
