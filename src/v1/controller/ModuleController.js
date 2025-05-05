const moduleService = require('../services/ModuleService');
const CustomError = require('../../utils/CustomError');

const createModuleRelatedTo = async (req, res, next) => {
    try {
        const calls = await moduleService.createModuleRelatedTo(req.body);
        res.status(201).success('Call status created successfully', calls);
    } catch (error) {
        next(error);
    }
};

const updateModuleRelatedTo = async (req, res, next) => {
    try {
        const calls = await moduleService.updateModuleRelatedTo(req.params.id, req.body);
        res.status(200).success('Call status updated successfully', calls);
    } catch (error) {
        next(error);
    }
};

const deleteModuleRelatedTo = async (req, res, next) => {
    try {
        await moduleService.deleteModuleRelatedTo(req.params.id);
        res.status(200).success('Call status deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getModuleRelatedTos = async (req, res, next) => {
    try {
        const {search,page,size} = req.query
        const calls = await moduleService.getModuleRelatedTos(search,Number(page),Number(size));
        res.status(200).success(null, calls);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createModuleRelatedTo,
    updateModuleRelatedTo,
    deleteModuleRelatedTo,
    getModuleRelatedTos,
};
