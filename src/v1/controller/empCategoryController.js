const empCategoryService = require('../services/empCategoryService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment") 

const createEmpCategory = async (req, res, next) => {
    try {
        let empCategoryData = { ...req.body };
        const empCategory = await empCategoryService.createEmpCategory(empCategoryData);
        res.status(201).success('Employee category created successfully', empCategory);
    } catch (error) {
        next(error);
    }
};

const findEmpCategoryById = async (req, res, next) => {
    try {
        const empCategory = await empCategoryService.findEmpCategoryById(req.params.id);
        if (!empCategory) throw new CustomError('Employee category not found', 404);

        res.status(200).success(null, empCategory);
    } catch (error) {
        next(error);
    }
};

const updateEmpCategory = async (req, res, next) => {
    try {
        let empCategoryData = { ...req.body };
        const designation = await empCategoryService.updateEmpCategory(req.params.id, empCategoryData);
        res.status(200).success('Employee category updated successfully', designation);
    } catch (error) {
        next(error);
    }
};

const deleteEmpCategory = async (req, res, next) => {
    try {
        await empCategoryService.deleteEmpCategory(req.params.id);
        res.status(200).success('Employee category deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllEmpCategory = async (req, res, next) => {
    try {
        const { page , size , search ,startDate,endDate   } = req.query;
        const empCategories = await empCategoryService.getAllEmpCategory(Number(page), Number(size) ,search ,moment(startDate), moment(endDate));
        res.status(200).success(null, empCategories);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEmpCategory,
    findEmpCategoryById,
    updateEmpCategory,
    deleteEmpCategory,
    getAllEmpCategory,
};
