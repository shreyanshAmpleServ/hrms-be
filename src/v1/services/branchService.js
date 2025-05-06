const branchModel = require('../models/branchModel');

const createBranch = async (data) => {
    return await branchModel.createBranch(data);
};

const findBranchById = async (id) => {
    return await branchModel.findBranchById(id);
};

const updateBranch = async (id, data) => {
    return await branchModel.updateBranch(id, data);
};

const deleteBranch = async (id) => {
    return await branchModel.deleteBranch(id);
};

const getAllBranch = async (page , size , search ,startDate,endDate) => {
    return await branchModel.getAllBranch(page , size , search ,startDate,endDate);
};

module.exports = {
    createBranch,
    findBranchById,
    updateBranch,
    deleteBranch,
    getAllBranch,
};