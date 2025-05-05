const contactStageService = require('../services/contactStageService');
const CustomError = require('../../utils/CustomError');

const createContactStage = async (req, res, next) => {
    try {
        const contactStage = await contactStageService.createContactStage(req.body);
        res.status(201).success('Contact stage created successfully', contactStage);
    } catch (error) {
        next(error);
    }
};

const getContactStageById = async (req, res, next) => {
    try {
        const contactStage = await contactStageService.findContactStageById(req.params.id);
        if (!contactStage) throw new CustomError('Contact stage not found', 404);
        res.status(200).success(null, contactStage);
    } catch (error) {
        next(error);
    }
};

const updateContactStage = async (req, res, next) => {
    try {
        const contactStage = await contactStageService.updateContactStage(req.params.id, req.body);
        res.status(200).success('Contact stage updated successfully', contactStage);
    } catch (error) {
        next(error);
    }
};

const deleteContactStage = async (req, res, next) => {
    try {
        await contactStageService.deleteContactStage(req.params.id);
        res.status(200).success('Contact stage deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllContactStages = async (req, res, next) => {
    try {
        const contactStages = await contactStageService.getAllContactStages();
        res.status(200).success(null, contactStages);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createContactStage,
    getContactStageById,
    updateContactStage,
    deleteContactStage,
    getAllContactStages,
};
