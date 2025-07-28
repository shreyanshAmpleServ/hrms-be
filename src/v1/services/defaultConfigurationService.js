const defaultConfigurationModel = require("../models/defaultConfigurationModel.js");

const createDefaultConfiguration = async (data) => {
  return await defaultConfigurationModel.createDefaultConfiguration(data);
};

const findDefaultConfiguration = async (data) => {
  return await defaultConfigurationModel.findDefaultConfiguration(data);
};

const updateDefaultConfiguration = async (id, data) => {
  return await defaultConfigurationModel.updateDefaultConfiguration(id, data);
};

const deleteDefaultConfiguration = async (data) => {
  return await defaultConfigurationModel.deleteDefaultConfiguration(data);
};

const getAllDefaultConfiguration = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await defaultConfigurationModel.getAllDefaultConfiguration(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createDefaultConfiguration,
  findDefaultConfiguration,
  updateDefaultConfiguration,
  getAllDefaultConfiguration,
  deleteDefaultConfiguration,
};
