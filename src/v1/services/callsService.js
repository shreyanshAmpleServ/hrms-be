const callsModel = require('../models/callsModel');

const createCalls = async (data,user) => {
    return await callsModel.createCalls(data,user);
};

const findCallsById = async (id) => {
    return await callsModel.findCallsById(id);
};

const updateCalls = async (id, data) => {
    return await callsModel.updateCalls(id, data);
};

const deleteCalls = async (id) => {
    return await callsModel.deleteCalls(id);
};

const getAllCalls = async (reqBody) => {
    return await callsModel.getAllCalls(reqBody);
};

module.exports = {
    createCalls,
    findCallsById,
    updateCalls,
    deleteCalls,
    getAllCalls,
};
