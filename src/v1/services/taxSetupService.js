const taxSetUpModal = require('../models/taxSetUpModal');

const createTaxSetup = async (data) => {
    return await taxSetUpModal.createTaxSetup(data);
};

const findTaxSetupById = async (id) => {
    return await taxSetUpModal.findTaxSetupById(id);
};

const updateTaxSetup = async (id, data) => {
    return await taxSetUpModal.updateTaxSetup(id, data);
};

const deleteSetup = async (id) => {
    return await taxSetUpModal.deleteSetup(id);
};

const getAllTaxSetup = async () => {
    return await taxSetUpModal.getAllTaxSetup();
};

module.exports = {
    createTaxSetup,
    findTaxSetupById,
    updateTaxSetup,
    deleteSetup,
    getAllTaxSetup,
};
