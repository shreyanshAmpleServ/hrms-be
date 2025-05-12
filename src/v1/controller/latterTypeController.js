const latterTypeService = require('../services/latterTypeService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment")


const createLatterType = async (req, res, next) => {
    try {
        let reqData = { ...req.body };
        const data = await latterTypeService.createLatterType(reqData);
        res.status(201).success('Latter type created successfully', data);
    } catch (error) {
        next(error);
    }
};

const findLatterTypeById = async (req, res, next) => {
    try {
        const data = await latterTypeService.findLatterTypeById(req.params.id);
        if (!data) throw new CustomError('Latter type not found', 404);

        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

const updateLatterType = async (req, res, next) => {
    try {
        let reqData = { ...req.body };

        const data = await latterTypeService.updateLatterType(req.params.id, reqData);
        res.status(200).success('Latter type updated successfully', data);
    } catch (error) {
        next(error);
    }
};

const deleteLatterType = async (req, res, next) => {
    try {
        await latterTypeService.deleteLatterType(req.params.id);
        res.status(200).success('Latter type deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllLatterType = async (req, res, next) => {
    try {
        const { page , size , search ,startDate,endDate   } = req.query;
        const data = await latterTypeService.getAllLatterType(Number(page), Number(size) ,search ,moment(startDate), moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createLatterType,
    findLatterTypeById,
    updateLatterType,
    deleteLatterType,
    getAllLatterType,
};
