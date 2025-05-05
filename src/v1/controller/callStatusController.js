const callStatusService = require('../services/callStatusesService');
const CustomError = require('../../utils/CustomError');

const createCallStatus = async (req, res, next) => {
    try {
        const callStatus = await callStatusService.createCallStatus(req.body);
        res.status(201).success('Call status created successfully', callStatus);
    } catch (error) {
        next(error);
    }
};

const getCallStatusById = async (req, res, next) => {
    try {
        const callStatus = await callStatusService.findCallStatusById(req.params.id);
        if (!callStatus) throw new CustomError('Call status not found', 404);
        res.status(200).success(null, callStatus);
    } catch (error) {
        next(error);
    }
};

const updateCallStatus = async (req, res, next) => {
    try {
        const callStatus = await callStatusService.updateCallStatus(req.params.id, req.body);
        res.status(200).success('Call status updated successfully', callStatus);
    } catch (error) {
        next(error);
    }
};

const deleteCallStatus = async (req, res, next) => {
    try {
        await callStatusService.deleteCallStatus(req.params.id);
        res.status(200).success('Call status deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllCallStatuses = async (req, res, next) => {
    try {
        const callStatuses = await callStatusService.getAllCallStatuses();
        res.status(200).success(null, callStatuses);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCallStatus,
    getCallStatusById,
    updateCallStatus,
    deleteCallStatus,
    getAllCallStatuses,
};
