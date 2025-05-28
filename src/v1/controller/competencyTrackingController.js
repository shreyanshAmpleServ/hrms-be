const competencyTrackingService = require('../services/competencyTrackingService');
const CustomError = require('../../utils/CustomError');
const moment = require('moment');

const createCompetencyTracking = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            createdby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await competencyTrackingService.createCompetencyTracking(data);
        res.status(201).success('Competency Tracking created successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const findCompetencyTrackingById = async (req, res, next) => {
    try {
        const reqData = await competencyTrackingService.findCompetencyTrackingById(req.params.id);
        if (!reqData) throw new CustomError('Competency Tracking not found', 404);
        res.status(200).success(null, reqData);
    } catch (error) {
        next(error);
    }
};

const updateCompetencyTracking = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            updatedby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await competencyTrackingService.updateCompetencyTracking(req.params.id, data);
        res.status(200).success('Competency Tracking updated successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const deleteCompetencyTracking = async (req, res, next) => {
    try {
        await competencyTrackingService.deleteCompetencyTracking(req.params.id);
        res.status(200).success('Competency Tracking deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllCompetencyTracking = async (req, res, next) => {
    try {
            const { page , size ,search ,startDate,endDate  } = req.query;
        const data = await competencyTrackingService.getAllCompetencyTracking(search,Number(page), Number(size),startDate && moment(startDate),endDate && moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCompetencyTracking,
    findCompetencyTrackingById,
    updateCompetencyTracking,
    deleteCompetencyTracking,
    getAllCompetencyTracking,
};
