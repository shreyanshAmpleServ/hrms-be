const eventLogService = require('../services/eventLogService');
const CustomError = require('../../utils/CustomError');
const moment = require('moment');

const createEventLog = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            createdby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await eventLogService.createEventLog(data);
        res.status(201).success('Work life event log created successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const findEventLogById = async (req, res, next) => {
    try {
        const reqData = await eventLogService.findEventLogById(req.params.id);
        if (!reqData) throw new CustomError('Work life event log not found', 404);
        res.status(200).success(null, reqData);
    } catch (error) {
        next(error);
    }
};

const updateEventLog = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            updatedby: req.user.id,
            log_inst: req.user.log_inst,  }
        const reqData = await eventLogService.updateEventLog(req.params.id, data);
        res.status(200).success('Work life event log updated successfully', reqData);
    } catch (error) {
        next(error);
    }
};

const deleteEventLog = async (req, res, next) => {
    try {
        await eventLogService.deleteEventLog(req.params.id);
        res.status(200).success('Work life event log deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllEventLog = async (req, res, next) => {
    try {
            const { page , size ,search ,startDate,endDate  } = req.query;
        const data = await eventLogService.getAllEventLog(search,Number(page), Number(size),startDate && moment(startDate),endDate && moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEventLog,
    findEventLogById,
    updateEventLog,
    deleteEventLog,
    getAllEventLog,
};
