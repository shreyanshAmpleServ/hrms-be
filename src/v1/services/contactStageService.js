const contactStageModel = require('../models/contactStageModel');

const createContactStage = async (data) => {
    return await contactStageModel.createContactStage(data);
};

const findContactStageById = async (id) => {
    return await contactStageModel.findContactStageById(id);
};

const updateContactStage = async (id, data) => {
    return await contactStageModel.updateContactStage(id, data);
};

const deleteContactStage = async (id) => {
    return await contactStageModel.deleteContactStage(id);
};

const getAllContactStages = async () => {
    return await contactStageModel.getAllContactStages();
};

module.exports = {
    createContactStage,
    findContactStageById,
    updateContactStage,
    deleteContactStage,
    getAllContactStages,
};
