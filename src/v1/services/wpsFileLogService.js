const wpsFileLogModel = require("../models/wpsFileLogModel");
const { getPrisma } = require("../../config/prismaContext.js");

const createWPSFile = async (data) => {
    return await wpsFileLogModel.createWPSFile(data);
};

const findWPSFileById = async (id) => {
    return await wpsFileLogModel.findWPSFileById(id);
};

const updateWPSFile = async (id, data) => {
    return await wpsFileLogModel.updateWPSFile(id, data);
};

const deleteWPSFile = async (id) => {
    return await wpsFileLogModel.deleteWPSFile(id);
};

const getAllWPSFile = async (search,page,size ,startDate, endDate) => {
    return await wpsFileLogModel.getAllWPSFile(search,page,size ,startDate, endDate);
};

module.exports = {
    createWPSFile,
    findWPSFileById,
    updateWPSFile,
    deleteWPSFile,
    getAllWPSFile,
};
