const grievanceTypeService = require('../services/grievanceTypeService');
const CustomError = require('../../utils/CustomError');
const { getPrisma } = require("../../config/prismaContext.js");
const moment = require("moment")


const createGrievanceType = async (req, res, next) => {
    try {
        let reqData = { ...req.body };
        const data = await grievanceTypeService.createGrievanceType(reqData);
        res.status(201).success('Grievance type created successfully', data);
    } catch (error) {
        next(error);
    }
};

const findGrievanceTypeById = async (req, res, next) => {
    try {
        const data = await grievanceTypeService.findGrievanceTypeById(req.params.id);
        if (!data) throw new CustomError('Grievance type not found', 404);

        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

const updateGrievanceType = async (req, res, next) => {
    try {
        let reqData = { ...req.body };

        const data = await grievanceTypeService.updateGrievanceType(req.params.id, reqData);
        res.status(200).success('Grievance type updated successfully', data);
    } catch (error) {
        next(error);
    }
};

const deleteGrievanceType = async (req, res, next) => {
    try {
        await grievanceTypeService.deleteGrievanceType(req.params.id);
        res.status(200).success('Grievance type deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllGrievanceType = async (req, res, next) => {
    try {
        const { page , size , search ,startDate,endDate   } = req.query;
        const data = await grievanceTypeService.getAllGrievanceType(Number(page), Number(size) ,search ,moment(startDate), moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createGrievanceType,
    findGrievanceTypeById,
    updateGrievanceType,
    deleteGrievanceType,
    getAllGrievanceType,
};
