const lostReasonService = require('../services/lostReasonService');
const CustomError = require('../../utils/CustomError');

const createLostReason = async (req, res, next) => {
    try {
        const lostReason = await lostReasonService.createLostReason(req.body);
        res.status(201).success('Lost reason created successfully', lostReason);
    } catch (error) {
        next(error);
    }
};

const getLostReasonById = async (req, res, next) => {
    try {
        const lostReason = await lostReasonService.findLostReasonById(req.params.id);
        if (!lostReason) throw new CustomError('Lost reason not found', 404);
        res.status(200).success(null, lostReason);
    } catch (error) {
        next(error);
    }
};

const updateLostReason = async (req, res, next) => {
    try {
        const lostReason = await lostReasonService.updateLostReason(req.params.id, req.body);
        res.status(200).success('Lost reason updated successfully', lostReason);
    } catch (error) {
        next(error);
    }
};

const deleteLostReason = async (req, res, next) => {
    try {
        await lostReasonService.deleteLostReason(req.params.id);
        res.status(200).success('Lost reason deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllLostReasons = async (req, res, next) => {
    try {
        const lostReasons = await lostReasonService.getAllLostReasons();
        res.status(200).success(null, lostReasons);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLostReason,
    getLostReasonById,
    updateLostReason,
    deleteLostReason,
    getAllLostReasons,
};
