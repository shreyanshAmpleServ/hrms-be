const paySlipModel = require("../models/paySlipModel");

const createPaySlip = async (data) => {
    return await paySlipModel.createPaySlip(data);
};

const findPaySlipById = async (id) => {
    return await paySlipModel.findPaySlipById(id);
};

const updatePaySlip = async (id, data) => {
    return await paySlipModel.updatePaySlip(id, data);
};

const deletePaySlip = async (id) => {
    return await paySlipModel.deletePaySlip(id);
};

const getAllPaySlip = async (search,page,size ,startDate, endDate) => {
    return await paySlipModel.getAllPaySlip(search,page,size ,startDate, endDate);
};

module.exports = {
    createPaySlip,
    findPaySlipById,
    updatePaySlip,
    deletePaySlip,
    getAllPaySlip,
};
