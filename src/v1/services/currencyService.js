const currencyModel = require("../models/currencyModel");
const { getPrisma } = require("../../config/prismaContext.js");

const createCurrencyService = async (data) => {
  return await currencyModel.createCurrency(data);
};

const findCurrencyByIdService = async (id) => {
  return await currencyModel.findCurrencyById(id);
};

const updateCurrencyService = async (id, data) => {
  return await currencyModel.updateCurrency(id, data);
};

const deleteCurrencyService = async (id) => {
  return await currencyModel.deleteCurrency(id);
};

const getAllCurrenciesService = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await currencyModel.getAllCurrency(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createCurrencyService,
  findCurrencyByIdService,
  updateCurrencyService,
  deleteCurrencyService,
  getAllCurrenciesService,
};
