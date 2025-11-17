const TimeSheetModel = require('../models/TimeSheetModel');
const { getPrisma } = require("../../config/prismaContext.js");

const createTimeSheet = async (data) => {
    return await TimeSheetModel.createTimeSheet(data);
};

const findTimeSheetById = async (id) => {
    return await TimeSheetModel.findTimeSheetById(id);
};

const updateTimeSheet = async (id, data) => {
    return await TimeSheetModel.updateTimeSheet(id, data);
};

const deleteTimeSheet = async (id) => {
    return await TimeSheetModel.deleteTimeSheet(id);
};

const getAllTimeSheet = async (search,page,size ,startDate, endDate) => {
    return await TimeSheetModel.getAllTimeSheet(search,page,size ,startDate, endDate);
};

module.exports = {
    createTimeSheet,
    findTimeSheetById,
    updateTimeSheet,
    deleteTimeSheet,
    getAllTimeSheet,
};
