const eventTypeService = require('../services/eventTypeService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment")


const createWorkEventType = async (req, res, next) => {
    try {
        let reqData = { ...req.body };
        const data = await eventTypeService.createWorkEventType(reqData);
        res.status(201).success('Work life event type created successfully', data);
    } catch (error) {
        next(error);
    }
};

const findWorkEventTypeById = async (req, res, next) => {
    try {
        const data = await eventTypeService.findWorkEventTypeById(req.params.id);
        if (!data) throw new CustomError('Work life event type not found', 404);

        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

const updateWorkEventType = async (req, res, next) => {
    try {
        let reqData = { ...req.body };

        const data = await eventTypeService.updateWorkEventType(req.params.id, reqData);
        res.status(200).success('Work life event type updated successfully', data);
    } catch (error) {
        next(error);
    }
};

const deleteWorkEventType = async (req, res, next) => {
    try {
        await eventTypeService.deleteWorkEventType(req.params.id);
        res.status(200).success('Work life event type deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllWorkEventType = async (req, res, next) => {
    try {
        const { page , size , search ,startDate,endDate   } = req.query;
        const data = await eventTypeService.getAllWorkEventType(Number(page), Number(size) ,search ,moment(startDate), moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createWorkEventType,
    findWorkEventTypeById,
    updateWorkEventType,
    deleteWorkEventType,
    getAllWorkEventType,
};
