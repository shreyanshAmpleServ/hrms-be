const industryModel = require('../models/industryModel');

const createIndustry = async (data) => {
    return await industryModel.createIndustry(data);
};

const findIndustryById = async (id) => {
    return await industryModel.findIndustryById(id);
};

const updateIndustry = async (id, data) => {
    return await industryModel.updateIndustry(id, data);
};

const deleteIndustry = async (id) => {
    return await industryModel.deleteIndustry(id);
};

const getAllIndustries = async () => {
    return await industryModel.getAllIndustries();
};

module.exports = {
    createIndustry,
    findIndustryById,
    updateIndustry,
    deleteIndustry,
    getAllIndustries,
};
