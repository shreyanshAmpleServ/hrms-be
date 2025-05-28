const trainingFeedbackModel = require('../models/trainingFeedbackModel');

const createTrainingFeedback = async (data) => {
    return await trainingFeedbackModel.createTrainingFeedback(data);
};

const findTrainingFeedbackById = async (id) => {
    return await trainingFeedbackModel.findTrainingFeedbackById(id);
};

const updateTrainingFeedback = async (id, data) => {
    return await trainingFeedbackModel.updateTrainingFeedback(id, data);
};

const deleteTrainingFeedback = async (id) => {
    return await trainingFeedbackModel.deleteTrainingFeedback(id);
};

const getAllTrainingFeedback = async (search,page,size ,startDate, endDate) => {
    return await trainingFeedbackModel.getAllTrainingFeedback(search,page,size ,startDate, endDate);
};

module.exports = {
    createTrainingFeedback,
    findTrainingFeedbackById,
    updateTrainingFeedback,
    deleteTrainingFeedback,
    getAllTrainingFeedback,
};
