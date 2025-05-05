const callPurposeService = require('../services/callPurposeService');
const CustomError = require('../../utils/CustomError');

const createCallPurpose = async (req, res, next) => {
    try {
        const callPurpose = await callPurposeService.createCallPurpose(req.body);
        res.status(201).success('Call purpose created successfully', callPurpose);
    } catch (error) {
        next(error);
    }
};

const getCallPurposeById = async (req, res, next) => {
    try {
        const callPurpose = await callPurposeService.findCallPurposeById(req.params.id);
        if (!callPurpose) throw new CustomError('Call purpose not found', 404);
        res.status(200).success(null, callPurpose);
    } catch (error) {
        next(error);
    }
};

const updateCallPurpose = async (req, res, next) => {
    try {
        const callPurpose = await callPurposeService.updateCallPurpose(req.params.id, req.body);
        res.status(200).success('Call purpose updated successfully', callPurpose);
    } catch (error) {
        next(error);
    }
};

const deleteCallPurpose = async (req, res, next) => {
    try {
        await callPurposeService.deleteCallPurpose(req.params.id);
        res.status(200).success('Call purpose deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllCallPurpose = async (req, res, next) => {
    try {
        const callPurposes = await callPurposeService.getAllCallPurposes();
        res.status(200).success(null, callPurposes);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCallPurpose,
    getCallPurposeById,
    updateCallPurpose,
    deleteCallPurpose,
    getAllCallPurpose,
};
