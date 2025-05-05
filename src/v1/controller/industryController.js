const industryService = require('../services/industryService');
const CustomError = require('../../utils/CustomError');

const createIndustry = async (req, res, next) => {
    try {
        const industry = await industryService.createIndustry(req.body);
        res.status(201).success('Industry created successfully', industry);
    } catch (error) {
        next(error);
    }
};

const getIndustryById = async (req, res, next) => {
    try {
        const industry = await industryService.findIndustryById(req.params.id);
        if (!industry) throw new CustomError('Industry not found', 404);
        res.status(200).success(null, industry);
    } catch (error) {
        next(error);
    }
};

const updateIndustry = async (req, res, next) => {
    try {
        const industry = await industryService.updateIndustry(req.params.id, req.body);
        res.status(200).success('Industry updated successfully', industry);
    } catch (error) {
        next(error);
    }
};

const deleteIndustry = async (req, res, next) => {
    try {
        await industryService.deleteIndustry(req.params.id);
        res.status(200).success('Industry deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllIndustries = async (req, res, next) => {
    try {
        const industries = await industryService.getAllIndustries();
        res.status(200).success(null, industries);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createIndustry,
    getIndustryById,
    updateIndustry,
    deleteIndustry,
    getAllIndustries,
};
