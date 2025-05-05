const currencyService = require('../services/currencyService');
const CustomError = require('../../utils/CustomError');

const createCurrency = async (req, res, next) => {
    try {
        const currency = await currencyService.createCurrencyService(req.body);
        res.status(201).success('Currency created successfully', currency);
    } catch (error) {
        next(error);
    }
};

const getCurrencyById = async (req, res, next) => {
    try {
        const currency = await currencyService.findCurrencyByIdService(req.params.id);
        if (!currency) throw new CustomError('Currency not found', 404);
        res.status(200).success(null, currency);
    } catch (error) {
        next(error);
    }
};

const updateCurrency = async (req, res, next) => {
    try {
        const currency = await currencyService.updateCurrencyService(req.params.id, req.body);
        res.status(200).success('Currency updated successfully', currency);
    } catch (error) {
        next(error);
    }
};

const deleteCurrency = async (req, res, next) => {
    try {
        await currencyService.deleteCurrencyService(req.params.id);
        res.status(200).success('Currency deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllCurrencies = async (req, res, next) => {
    try {
        const currencies = await currencyService.getAllCurrenciesService();
        res.status(200).success(null, currencies);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCurrency,
    getCurrencyById,
    updateCurrency,
    deleteCurrency,
    getAllCurrencies,
};