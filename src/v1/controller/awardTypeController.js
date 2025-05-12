const awardTypeService = require('../services/awardTypeService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment")


const createAwardType = async (req, res, next) => {
    try {
        let reqData = { ...req.body };
        const data = await awardTypeService.createAwardType(reqData);
        res.status(201).success('Award type created successfully', data);
    } catch (error) {
        next(error);
    }
};

const findAwardTypeById = async (req, res, next) => {
    try {
        const data = await awardTypeService.findAwardTypeById(req.params.id);
        if (!data) throw new CustomError('Award type not found', 404);

        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

const updateAwardType = async (req, res, next) => {
    try {
        let reqData = { ...req.body };

        const data = await awardTypeService.updateAwardType(req.params.id, reqData);
        res.status(200).success('Award type updated successfully', data);
    } catch (error) {
        next(error);
    }
};

const deleteAwardType = async (req, res, next) => {
    try {
        await awardTypeService.deleteAwardType(req.params.id);
        res.status(200).success('Award type deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllAwardType = async (req, res, next) => {
    try {
        const { page , size , search ,startDate,endDate   } = req.query;
        const data = await awardTypeService.getAllAwardType(Number(page), Number(size) ,search ,moment(startDate), moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAwardType,
    findAwardTypeById,
    updateAwardType,
    deleteAwardType,
    getAllAwardType,
};
