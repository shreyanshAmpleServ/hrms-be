const competencyTrackingModel = require('../models/competencyTrackingModel');

const createCompetencyTracking = async (data) => {
    return await competencyTrackingModel.createCompetencyTracking(data);
};

const findCompetencyTrackingById = async (id) => {
    return await competencyTrackingModel.findCompetencyTrackingById(id);
};

const updateCompetencyTracking = async (id, data) => {
    return await competencyTrackingModel.updateCompetencyTracking(id, data);
};

const deleteCompetencyTracking = async (id) => {
    return await competencyTrackingModel.deleteCompetencyTracking(id);
};

const getAllCompetencyTracking = async (search,page,size ,startDate, endDate) => {
    return await competencyTrackingModel.getAllCompetencyTracking(search,page,size ,startDate, endDate);
};

module.exports = {
    createCompetencyTracking,
    findCompetencyTrackingById,
    updateCompetencyTracking,
    deleteCompetencyTracking,
    getAllCompetencyTracking,
};
