const empTypeService = require('../services/empTypeService');
const CustomError = require('../../utils/CustomError');

const createEmpType = async (req, res, next) => {
    try {
        let empTypeData = { ...req.body };
        const empType = await empTypeService.createEmpType(empTypeData);
        res.status(201).success('Employee type created successfully', empType);
    } catch (error) {
        next(error);
    }
};

const findEmpTypeById = async (req, res, next) => {
    try {
        const empType = await empTypeService.findEmpTypeById(req.params.id);
        if (!empType) throw new CustomError('Employee type not found', 404);

        res.status(200).success(null, empType);
    } catch (error) {
        next(error);
    }
};

const updateEmpType = async (req, res, next) => {
    try {
        let empTypeData = { ...req.body };
        const empType = await empTypeService.updateEmpType(req.params.id, empTypeData);
        res.status(200).success('Employee type updated successfully', empType);
    } catch (error) {
        next(error);
    }
};

const deleteEmpType = async (req, res, next) => {
    try {
        await empTypeService.deleteEmpType(req.params.id);
        res.status(200).success('Employee type deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllEmpType = async (req, res, next) => {
    try {
        const { page , size , search ,startDate,endDate   } = req.query;
        const empTypes = await empTypeService.getAllEmpType(Number(page), Number(size) ,search ,moment(startDate), moment(endDate));
        res.status(200).success(null, empTypes);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEmpType,
    findEmpTypeById,
    updateEmpType,
    deleteEmpType,
    getAllEmpType,
};
