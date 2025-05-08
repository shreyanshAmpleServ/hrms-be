const taxReliefModel = require('../models/taxReliefModel');

const createTaxRelief = async (data) => {
  return await taxReliefModel.createTaxRelief(data);
};

const findTaxReliefById = async (id) => {
  return await taxReliefModel.findTaxReliefById(id);
};

const updateTaxRelief = async (id, data) => {
  return await taxReliefModel.updateTaxRelief(id, data);
};

const deleteTaxRelief = async (id) => {
  return await taxReliefModel.deleteTaxRelief(id);
};

const getAllTaxRelief = async (page, size, search,  startDate,endDate) => {
  return await taxReliefModel.getAllTaxRelief(page, size, search,  startDate,endDate);
};

module.exports = {
  createTaxRelief,
  findTaxReliefById,
  updateTaxRelief,
  deleteTaxRelief,
  getAllTaxRelief,
};