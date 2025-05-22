const resumeUploadModel = require("../models/resumeUploadModel");

const createResumeUpload = async (data) => {
    return await resumeUploadModel.createResumeUpload(data);
};

const findResumeUploadById = async (id) => {
    return await resumeUploadModel.findResumeUploadById(id);
};

const updateResumeUpload = async (id, data) => {
    return await resumeUploadModel.updateResumeUpload(id, data);
};

const deleteResumeUpload = async (id) => {
    return await resumeUploadModel.deleteResumeUpload(id);
};

const getAllResumeUpload = async (search,page,size ,startDate, endDate) => {
    return await resumeUploadModel.getAllResumeUpload(search,page,size ,startDate, endDate);
};

module.exports = {
    createResumeUpload,
    findResumeUploadById,
    updateResumeUpload,
    deleteResumeUpload,
    getAllResumeUpload,
};
