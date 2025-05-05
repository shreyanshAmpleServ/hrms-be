const priceBookModal = require('../models/priceBookModal');

const createPriceBook = async (orderData,orderItemsData) => {
    return await priceBookModal.createPriceBook(orderData,orderItemsData);
};

const findPriceBookById = async (id) => {
    return await priceBookModal.findPriceBookById(id);
};

const updatePriceBook = async (id, orderData,orderItemsData) => {
    return await priceBookModal.updatePriceBook(id, orderData,orderItemsData);
};

const deletePriceBook = async (id) => {
    return await priceBookModal.deletePriceBook(id);
};

const getAllPriceBook = async (search ,page , size,startDate,endDate) => {
    return await priceBookModal.getAllPriceBook(search ,page , size,startDate,endDate);
};

module.exports = {
    createPriceBook,
    findPriceBookById,
    updatePriceBook,
    deletePriceBook,
    getAllPriceBook,
};
