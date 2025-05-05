const callResultService = require('../services/callResultService');
const CustomError = require('../../utils/CustomError');

const createCallResult = async (req, res, next) => {
    try {
        const callResult = await callResultService.createCallResult(req.body);
        res.status(201).success('Call result created successfully', callResult);
    } catch (error) {
        next(error);
    }
};

const getCallResultById = async (req, res, next) => {
    try {
        const callResult = await callResultService.findCallPurposeById(req.params.id);
        if (!callResult) throw new CustomError('Call result not found', 404);
        res.status(200).success(null, callResult);
    } catch (error) {
        next(error);
    }
};

const updateCallResult = async (req, res, next) => {
    try {
        const callResult = await callResultService.updateCallResult(req.params.id, req.body);
        res.status(200).success('Call result updated successfully', callResult);
    } catch (error) {
        next(error);
    }
};

const deleteCallResult = async (req, res, next) => {
    try {
        await callResultService.deleteCallResult(req.params.id);
        res.status(200).success('Call result deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllCallResults = async (req, res, next) => {
    try {
        const callResults = await callResultService.getAllCallResults();
        res.status(200).success(null, callResults);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCallResult,
    getCallResultById,
    updateCallResult,
    deleteCallResult,
    getAllCallResults,
};
