const callStatusesModel = require('../models/callStatusesModel');

const createCallStatus = async (data) => {
    return await callStatusesModel.createCallStatus(data);
};

const findCallStatusById = async (id) => {
    return await callStatusesModel.findCallStatusById(id);
};

const updateCallStatus = async (id, data) => {
    return await callStatusesModel.updateCallStatus(id, data);
};

const deleteCallStatus = async (id) => {
    return await callStatusesModel.deleteCallStatus(id);
};

const getAllCallStatuses = async () => {
    return await callStatusesModel.getAllCallStatuses();
};

module.exports = {
    createCallStatus,
    findCallStatusById,
    updateCallStatus,
    deleteCallStatus,
    getAllCallStatuses,
};
