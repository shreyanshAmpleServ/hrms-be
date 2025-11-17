const JobPostingModel = require('../models/JobPostingModel');
const { getPrisma } = require("../../config/prismaContext.js");

const createJobPosting = async (data) => {
    return await JobPostingModel.createJobPosting(data);
};

const findJobPostingById = async (id) => {
    return await JobPostingModel.findJobPostingById(id);
};

const updateJobPosting = async (id, data) => {
    return await JobPostingModel.updateJobPosting(id, data);
};

const deleteJobPosting = async (id) => {
    return await JobPostingModel.deleteJobPosting(id);
};

const getAllJobPosting = async (search,page,size ,startDate, endDate) => {
    return await JobPostingModel.getAllJobPosting(search,page,size ,startDate, endDate);
};

module.exports = {
    createJobPosting,
    findJobPostingById,
    updateJobPosting,
    deleteJobPosting,
    getAllJobPosting,
};
