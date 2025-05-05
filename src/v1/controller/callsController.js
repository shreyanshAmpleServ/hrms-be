const callsService = require('../services/callsService');
const CustomError = require('../../utils/CustomError');

const createCalls = async (req, res, next) => {
    try {
        const calls = await callsService.createCalls(req.body, req.user);
        res.status(201).success('Call status created successfully', calls);
    } catch (error) {
        next(error);
    }
};

const getCallsById = async (req, res, next) => {
    try {
        const calls = await callsService.findCallsById(req.params.id);
        if (!calls) throw new CustomError('Call status not found', 404);
        res.status(200).success(null, calls);
    } catch (error) {
        next(error);
    }
};

const updateCalls = async (req, res, next) => {
    try {
        const calls = await callsService.updateCalls(req.params.id, req.body);
        res.status(200).success('Call status updated successfully', calls);
    } catch (error) {
        next(error);
    }
};

const deleteCalls = async (req, res, next) => {
    try {
        await callsService.deleteCalls(req.params.id);
        res.status(200).success('Call status deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllCalls = async (req, res, next) => {
    try {
        const calls = await callsService.getAllCalls(req.query);
        res.status(200).success(null, calls);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCalls,
    getCallsById,
    updateCalls,
    deleteCalls,
    getAllCalls,
};
