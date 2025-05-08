const PFService = require('../services/PFService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment")


const createPF = async (req, res, next) => {
    try {
        let reqData = { ...req.body };
        const data = await PFService.createPF(reqData);
        res.status(201).success('PF created successfully', data);
    } catch (error) {
        next(error);
    }
};

const findPFById = async (req, res, next) => {
    try {
        const data = await PFService.findPFById(req.params.id);
        if (!data) throw new CustomError('PF not found', 404);

        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

const updatePF = async (req, res, next) => {
    try {
        let reqData = { ...req.body };

        const data = await PFService.updatePF(req.params.id, reqData);
        res.status(200).success('PF updated successfully', data);
    } catch (error) {
        next(error);
    }
};

const deletePF = async (req, res, next) => {
    try {
        await PFService.deletePF(req.params.id);
        res.status(200).success('PF deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllPF = async (req, res, next) => {
    try {
        const { page , size , search ,startDate,endDate   } = req.query;
        const data = await PFService.getAllPF(Number(page), Number(size) ,search ,moment(startDate), moment(endDate));
        res.status(200).success(null, data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPF,
    findPFById,
    updatePF,
    deletePF,
    getAllPF,
};
