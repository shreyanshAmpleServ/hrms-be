const eventLogModel = require('../models/eventLogModel');
const { getPrisma } = require("../../config/prismaContext.js");

const createEventLog = async (data) => {
    return await eventLogModel.createEventLog(data);
};

const findEventLogById = async (id) => {
    return await eventLogModel.findEventLogById(id);
};

const updateEventLog = async (id, data) => {
    return await eventLogModel.updateEventLog(id, data);
};

const deleteEventLog = async (id) => {
    return await eventLogModel.deleteEventLog(id);
};

const getAllEventLog = async (search,page,size ,startDate, endDate) => {
    return await eventLogModel.getAllEventLog(search,page,size ,startDate, endDate);
};

module.exports = {
    createEventLog,
    findEventLogById,
    updateEventLog,
    deleteEventLog,
    getAllEventLog,
};
