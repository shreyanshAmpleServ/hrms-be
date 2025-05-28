const trainingFeedbackService = require('../services/trainingFeedbackService');
const CustomError = require('../../utils/CustomError');
const moment = require('moment');

const createTrainingFeedback = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            createdby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await trainingFeedbackService.createTrainingFeedback(data);
        res.status(201).success('Training feedback created successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const findTrainingFeedbackById = async (req, res, next) => {
    try {
        const reqData = await trainingFeedbackService.findTrainingFeedbackById(req.params.id);
        if (!reqData) throw new CustomError('Training feedback not found', 404);
        res.status(200).success(null, reqData);
    } catch (error) {
        next(error);
    }
};

const updateTrainingFeedback = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            updatedby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await trainingFeedbackService.updateTrainingFeedback(req.params.id, data);
        res.status(200).success('Training feedback updated successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const deleteTrainingFeedback = async (req, res, next) => {
    try {
        await trainingFeedbackService.deleteTrainingFeedback(req.params.id);
        res.status(200).success('Training feedback deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllTrainingFeedback = async (req, res, next) => {
    try {
            const { page , size ,search ,startDate,endDate  } = req.query;
        const data = await trainingFeedbackService.getAllTrainingFeedback(search,Number(page), Number(size),startDate && moment(startDate),endDate && moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTrainingFeedback,
    findTrainingFeedbackById,
    updateTrainingFeedback,
    deleteTrainingFeedback,
    getAllTrainingFeedback,
};
