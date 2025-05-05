const sourceModel = require('../models/SourceModel');

const createSource = async (data) => {
  return await sourceModel.createSource(data);
};

const findSourceById = async (id) => {
  return await sourceModel.findSourceById(id);
};

const updateSource = async (id, data) => {
  return await sourceModel.updateSource(id, data);
};

const deleteSource = async (id) => {
  return await sourceModel.deleteSource(id);
};

const getAllSources = async () => {
  return await sourceModel.getAllSources();
};

module.exports = {
  createSource,
  findSourceById,
  updateSource,
  deleteSource,
  getAllSources,
};
