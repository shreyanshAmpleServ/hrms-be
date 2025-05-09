const GoalCategoryService = require('../services/GoalCategoryService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment")


const createGoalCategory = async (req, res, next) => {
    try {
        let reqData = { ...req.body };
        const data = await GoalCategoryService.createGoalCategory(reqData);
        res.status(201).success('Goal category created successfully', data);
    } catch (error) {
        next(error);
    }
};

const findGoalCategoryById = async (req, res, next) => {
    try {
        const data = await GoalCategoryService.findGoalCategoryById(req.params.id);
        if (!data) throw new CustomError('Goal category not found', 404);

        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

const updateGoalCategory = async (req, res, next) => {
    try {
        let reqData = { ...req.body };

        const data = await GoalCategoryService.updateGoalCategory(req.params.id, reqData);
        res.status(200).success('Goal category updated successfully', data);
    } catch (error) {
        next(error);
    }
};

const deleteGoalCategory = async (req, res, next) => {
    try {
        await GoalCategoryService.deleteGoalCategory(req.params.id);
        res.status(200).success('Goal category deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllGoalCategory = async (req, res, next) => {
    try {
        const { page , size , search ,startDate,endDate   } = req.query;
        const data = await GoalCategoryService.getAllGoalCategory(Number(page), Number(size) ,search ,moment(startDate), moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createGoalCategory,
    findGoalCategoryById,
    updateGoalCategory,
    deleteGoalCategory,
    getAllGoalCategory,
};
