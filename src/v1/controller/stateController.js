const statesService = require('../services/stateService');
const CustomError = require('../../utils/CustomError');

const createState = async (req, res, next) => {
    try {
        const state = await statesService.createState(req.body);
        res.status(201).success('State created successfully', state);
    } catch (error) {
        next(error);
    }
};

const getStateById = async (req, res, next) => {
    try {
        const state = await statesService.findStateById(req.params.id);
        if (!state) throw new CustomError('State not found', 404);
        res.status(200).success(null, state);
    } catch (error) {
        next(error);
    }
};

const updateState = async (req, res, next) => {
    try {
        const state = await statesService.updateState(req.params.id, req.body);
        res.status(200).success('State updated successfully', state);
    } catch (error) {
        next(error);
    }
};

const deleteState = async (req, res, next) => {
    try {
        await statesService.deleteState(req.params.id);
        res.status(200).success('State deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllStates = async (req, res, next) => {
    try {
        const { search,page,size,country_id} = req.query
        const states = await statesService.getAllStates(search,Number(page),Number(size),Number(country_id));
        res.status(200).success(null, states);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createState,
    getStateById,
    updateState,
    deleteState,
    getAllStates,
};
