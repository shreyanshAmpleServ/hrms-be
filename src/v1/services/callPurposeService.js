const callPurposesModel = require('../models/callPurposesModel');

const createCallPurpose = async (data) => {
    return await callPurposesModel.createCallPurpose(data);
};

const findCallPurposeById = async (id) => {
    return await callPurposesModel.findCallPurposeById(id);
};

const updateCallPurpose = async (id, data) => {
    return await callPurposesModel.updateCallPurpose(id, data);
};

const deleteCallPurpose = async (id) => {
    return await callPurposesModel.deleteCallPurpose(id);
};

const getAllCallPurposes = async () => {
    return await callPurposesModel.getAllCallPurposes();
};

module.exports = {
    createCallPurpose,
    findCallPurposeById,
    updateCallPurpose,
    deleteCallPurpose,
    getAllCallPurposes,
};
