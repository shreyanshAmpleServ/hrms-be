const loanTypeModel = require("../models/loanTypeModel");

const createLoanType = async (data) => {
    return await loanTypeModel.createLoanType(data);
};

const findLoanTypeById = async (id) => {
    return await loanTypeModel.findLoanTypeById(id);
};

const updateLoanType = async (id, data) => {
    return await loanTypeModel.updateLoanType(id, data);
};

const deleteLoanType = async (id) => {
    return await loanTypeModel.deleteLoanType(id);
};

const getAllLoanType = async (search,page,size ,startDate, endDate) => {
    return await loanTypeModel.getAllLoanType(search,page,size ,startDate, endDate);
};

module.exports = {
    createLoanType,
    findLoanTypeById,
    updateLoanType,
    deleteLoanType,
    getAllLoanType,
};
