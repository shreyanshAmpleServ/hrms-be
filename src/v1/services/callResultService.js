const callResultsModel = require('../models/callResultsModel');

const createCallResult = async (data) => {
    return await callResultsModel.createCallResult(data);
};

const findCallResultById = async (id) => {
    return await callResultsModel.findCallResultById(id);
};

const updateCallResult = async (id, data) => {
    return await callResultsModel.updateCallResult(id, data);
};

const deleteCallResult = async (id) => {
    return await callResultsModel.deleteCallResult(id);
};

const getAllCallResults = async () => {
    return await callResultsModel.getAllCallResults();
};

module.exports = {
    createCallResult,
    findCallResultById,
    updateCallResult,
    deleteCallResult,
    getAllCallResults,
};
