const callTypeService = require('../services/callTypeService');
const CustomError = require('../../utils/CustomError');

const createCallType = async (req, res, next) => {
    try {
        const callStatus = await callTypeService.createCallType(req.body);
        res.status(201).success('Call status created successfully', callStatus);
    } catch (error) {
        next(error);
    }
};

const getCallTypeById = async (req, res, next) => {
    try {
        const callStatus = await callTypeService.findCallPurposeById(req.params.id);
        if (!callStatus) throw new CustomError('Call status not found', 404);
        res.status(200).success(null, callStatus);
    } catch (error) {
        next(error);
    }
};

const updateCallType = async (req, res, next) => {
    try {
        const callStatus = await callTypeService.updateCallType(req.params.id, req.body);
        res.status(200).success('Call status updated successfully', callStatus);
    } catch (error) {
        next(error);
    }
};

const deleteCallType = async (req, res, next) => {
    try {
        await callTypeService.deleteCallType(req.params.id);
        res.status(200).success('Call status deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllCallTypes = async (req, res, next) => {
    try {
        const callStatuses = await callTypeService.getAllCallTypes();
        res.status(200).success(null, callStatuses);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCallType,
    getCallTypeById,
    updateCallType,
    deleteCallType,
    getAllCallTypes,
};
