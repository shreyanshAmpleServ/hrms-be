const jobCategoryService = require('../services/jobCategoryService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment")


const createJobCategory = async (req, res, next) => {
    try {
        let reqData = { ...req.body };
        const data = await jobCategoryService.createJobCategory(reqData);
        res.status(201).success('Job category created successfully', data);
    } catch (error) {
        next(error);
    }
};

const findJobCategoryById = async (req, res, next) => {
    try {
        const data = await jobCategoryService.findJobCategoryById(req.params.id);
        if (!data) throw new CustomError('Job category not found', 404);

        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

const updateJobCategory = async (req, res, next) => {
    try {
        let reqData = { ...req.body };

        const data = await jobCategoryService.updateJobCategory(req.params.id, reqData);
        res.status(200).success('Job category updated successfully', data);
    } catch (error) {
        next(error);
    }
};

const deleteJobCategory = async (req, res, next) => {
    try {
        await jobCategoryService.deleteJobCategory(req.params.id);
        res.status(200).success('Job category deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllJobCategory = async (req, res, next) => {
    try {
        const { page , size , search ,startDate,endDate   } = req.query;
        const data = await jobCategoryService.getAllJobCategory(Number(page), Number(size) ,search ,moment(startDate), moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createJobCategory,
    findJobCategoryById,
    updateJobCategory,
    deleteJobCategory,
    getAllJobCategory,
};
