const appraisalService = require('../services/appraisalService');
const CustomError = require('../../utils/CustomError');
const moment = require('moment');

const createAppraisalEntry = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            createdby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await appraisalService.createAppraisalEntry(data);
        res.status(201).success('Appraisal created successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const findAppraisalEntryById = async (req, res, next) => {
    try {
        const reqData = await appraisalService.findAppraisalEntryById(req.params.id);
        if (!reqData) throw new CustomError('Appraisal not found', 404);
        res.status(200).success(null, reqData);
    } catch (error) {
        next(error);
    }
};

const updateAppraisalEntry = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            updatedby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await appraisalService.updateAppraisalEntry(req.params.id, data);
        res.status(200).success('Appraisal updated successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const deleteAppraisalEntry = async (req, res, next) => {
    try {
        await appraisalService.deleteAppraisalEntry(req.params.id);
        res.status(200).success('Appraisal deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllAppraisalEntry = async (req, res, next) => {
    try {
            const { page , size ,search ,startDate,endDate  } = req.query;
        const data = await appraisalService.getAllAppraisalEntry(search,Number(page), Number(size),startDate && moment(startDate),endDate && moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAppraisalEntry,
    findAppraisalEntryById,
    updateAppraisalEntry,
    deleteAppraisalEntry,
    getAllAppraisalEntry,
};
