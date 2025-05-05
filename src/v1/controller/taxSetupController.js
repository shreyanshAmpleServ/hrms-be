const taxSetupService = require('../services/taxSetupService');
const CustomError = require('../../utils/CustomError');

const createTaxSetup = async (req, res, next) => {
    try {
        let userData = { ...req.body,createdby:req.user.id }; 
        const tax = await taxSetupService.createTaxSetup(userData);
        res.status(201).success('tax created successfully', tax);
    } catch (error) {
        next(error);
    }
};

const findTaxSetupById = async (req, res, next) => {
    try {
        const tax = await taxSetupService.findTaxSetupById(req.params.id);
        if (!tax) throw new CustomError('tax not found', 404);
        res.status(200).success(null, tax);
    } catch (error) {
        next(error);
    }
};

const updateTaxSetup = async (req, res, next) => {
    try {
        const taxData = {...req.body,updatedby:req.user.id}
        const tax = await taxSetupService.updateTaxSetup(req.params.id,taxData);
        res.status(200).success('tax updated successfully', tax);
    } catch (error) {
        next(error);
    }
};

const deleteSetup = async (req, res, next) => {
    try {
        await taxSetupService.deleteSetup(req.params.id);
        res.status(200).success('tax deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllTaxSetup = async (req, res, next) => {
    try {
        const taxs = await taxSetupService.getAllTaxSetup();
        res.status(200).success(null, taxs);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTaxSetup,
    findTaxSetupById,
    updateTaxSetup,
    deleteSetup,
    getAllTaxSetup,
};
