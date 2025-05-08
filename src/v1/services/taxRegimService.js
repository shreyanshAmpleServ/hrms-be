const taxRegimModel = require('../models/taxRegimModel');

const createTaxRegime = async (data) => {
  return await taxRegimModel.createTaxRegime(data);
};

const findTaxRegimeById = async (id) => {
  return await taxRegimModel.findTaxRegimeById(id);
};

const updateTaxRegime = async (id, data) => {
  return await taxRegimModel.updateTaxRegime(id, data);
};

const deleteTaxRegime = async (id) => {
  return await taxRegimModel.deleteTaxRegime(id);
};

const getAllTaxRegime = async (page, size, search,  startDate,endDate) => {
  return await taxRegimModel.getAllTaxRegime(page, size, search,  startDate,endDate);
};

module.exports = {
  createTaxRegime,
  findTaxRegimeById,
  updateTaxRegime,
  deleteTaxRegime,
  getAllTaxRegime,
};