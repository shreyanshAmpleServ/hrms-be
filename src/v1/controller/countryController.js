const countryService = require('../services/countryService');
const CustomError = require('../../utils/CustomError');

const createCountry = async (req, res, next) => {
  try {
    const country = await countryService.createCountryService(req.body);
    res.status(201).success('Country created successfully', country);
  } catch (error) {
    next(error);
  }
};

const getCountryById = async (req, res, next) => {
  try {
    const country = await countryService.findCountryByIdService(req.params.id);
    if (!country) throw new CustomError('Country not found', 404);
    res.status(200).success(null, country);
  } catch (error) {
    next(error);
  }
};

const updateCountry = async (req, res, next) => {
  try {
    const country = await countryService.updateCountryService(req.params.id, req.body);
    res.status(200).success('Country updated successfully', country);
  } catch (error) {
    next(error);
  }
};

const deleteCountry = async (req, res, next) => {
  try {
    await countryService.deleteCountryService(req.params.id);
    res.status(200).success('Country deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const getAllCountries = async (req, res, next) => {
  try {
    const countries = await countryService.getAllCountriesService();
    res.status(200).success(null, countries);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCountry,
  getCountryById,
  updateCountry,
  deleteCountry,
  getAllCountries,
};