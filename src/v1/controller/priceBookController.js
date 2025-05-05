const priceBookService = require('../services/priceBookService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment");

const createPriceBook = async (req, res, next) => {
    try {
        const { priceDetails, ...orderData } = req.body;
        
        const parsedPriceDetails = priceDetails ? priceDetails : [];
        const orderDAta =  { ...orderData, createdby: req.user.id }
        const product = await priceBookService.createPriceBook(orderDAta, parsedPriceDetails);
        res.status(201).success('Price book created successfully', product);
    } catch (error) {
        next(error);
    }
};

const findPriceBookById = async (req, res, next) => {
    try {
        const product = await priceBookService.findPriceBookById(req.params.id);
        if (!product) throw new CustomError('Price book not found', 404);
        res.status(200).success(null, product);
    } catch (error) {
        next(error);
    }
};

const updatePriceBook = async (req, res, next) => {
    try {
        const { priceDetails, id, ...orderData } = req.body;
        
        const parsedPriceDetails = priceDetails ? priceDetails : [];
        const orderDAta =  { ...orderData, updatedby: req.user.id }

        const product = await priceBookService.updatePriceBook(id,orderDAta, parsedPriceDetails);
        res.status(200).success('Price book updated successfully', product);
    } catch (error) {
        next(error);
    }
};

const deletePriceBook = async (req, res, next) => {
    try {
        await priceBookService.deletePriceBook(req.params.id);
        res.status(200).success('Price book deleted successfully', null);
    } catch (error) {
        next(error);
    }
};

const getAllPriceBook = async (req, res, next) => {
    try {
        const { page , size ,search ,startDate,endDate  } = req.query;
        const products = await priceBookService.getAllPriceBook(search ,Number(page), Number(size),moment(startDate),moment(endDate));
        res.status(200).success(null , products );
        // res.status(200).json({ success: true,   message:"product get successfully" , products });
    } catch (error) {
        next(error);
    }
};
module.exports = {
    createPriceBook,
    findPriceBookById,
    updatePriceBook,
    deletePriceBook,
    getAllPriceBook,
};
