const statesModel = require('../models/stateModel');

const createState = async (data) => {
    return await statesModel.createState(data);
};

const findStateById = async (id) => {
    return await statesModel.findStateById(id);
};

const updateState = async (id, data) => {
    return await statesModel.updateState(id, data);
};

const deleteState = async (id) => {
    return await statesModel.deleteState(id);
};

const getAllStates = async (country_id) => {
    return await statesModel.getAllStates(country_id);
};

module.exports = {
    createState,
    findStateById,
    updateState,
    deleteState,
    getAllStates,
};