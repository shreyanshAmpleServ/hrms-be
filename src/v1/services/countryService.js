const countryModel = require('../models/countryModel');

const createCountryService = async (data) => {
  return await countryModel.createCountry(data);
};

const findCountryByIdService = async (id) => {
  return await countryModel.findCountryById(id);
};

const updateCountryService = async (id, data) => {
  return await countryModel.updateCountry(id, data);
};

const deleteCountryService = async (id) => {
  return await countryModel.deleteCountry(id);
};

const getAllCountriesService = async () => {
  return await countryModel.getAllCountries();
};

module.exports = {
  createCountryService,
  findCountryByIdService,
  updateCountryService,
  deleteCountryService,
  getAllCountriesService,
};