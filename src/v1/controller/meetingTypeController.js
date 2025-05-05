const meetingTypeService = require('../services/meetingTypeService');
const CustomError = require('../../utils/CustomError');

const createMeetingType = async (req, res, next) => {
    try {
        const callStatus = await meetingTypeService.createMeetingType(req.body);
        res.status(201).success('Meeting type created successfully', callStatus);
    } catch (error) {
        next(error);
    }
};

const findMeetingTypeById = async (req, res, next) => {
    try {
        const callStatus = await meetingTypeService.findCallPurposeById(req.params.id);
        if (!callStatus) throw new CustomError('Meeting type not found', 404);
        res.status(200).success(null, callStatus);
    } catch (error) {
        next(error);
    }
};

const updateMeetingType = async (req, res, next) => {
    try {
        const callStatus = await meetingTypeService.updateMeetingType(req.params.id, req.body);
        res.status(200).success('Meeting type updated successfully', callStatus);
    } catch (error) {
        next(error);
    }
};

const deleteMeetingType = async (req, res, next) => {
    try {
        await meetingTypeService.deleteMeetingType(req.params.id);
        res.status(200).success('Meeting type deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllMeetingTypes = async (req, res, next) => {
    try {
        const callStatuses = await meetingTypeService.getAllMeetingTypes();
        res.status(200).success(null, callStatuses);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createMeetingType,
    findMeetingTypeById,
    updateMeetingType,
    deleteMeetingType,
    getAllMeetingTypes,
};
