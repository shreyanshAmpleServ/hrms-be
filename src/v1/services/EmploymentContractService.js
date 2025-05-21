const EmploymentContractModel = require("../models/employmentContractModel");

const createEmploymentContract = async (data) => {
    return await EmploymentContractModel.createEmploymentContract(data);
};

const findEmploymentContractById = async (id) => {
    return await EmploymentContractModel.findEmploymentContractById(id);
};

const updateEmploymentContract = async (id, data) => {
    return await EmploymentContractModel.updateEmploymentContract(id, data);
};

const deleteEmploymentContract = async (id) => {
    return await EmploymentContractModel.deleteEmploymentContract(id);
};

const getAllEmploymentContract = async (search,page,size ,startDate, endDate) => {
    return await EmploymentContractModel.getAllEmploymentContract(search,page,size ,startDate, endDate);
};

module.exports = {
    createEmploymentContract,
    findEmploymentContractById,
    updateEmploymentContract,
    deleteEmploymentContract,
    getAllEmploymentContract,
};
