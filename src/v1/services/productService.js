const productModal = require('../models/productModal');

const createProduct = async (data) => {
    return await productModal.createProduct(data);
};

const findProductById = async (id) => {
    return await productModal.findProductById(id);
};

const updateProduct = async (id, data) => {
    return await productModal.updateProduct(id, data);
};

const deleteProduct = async (id) => {
    return await productModal.deleteProduct(id);
};

const getAllProduct = async (search ,page , size ,startDate,endDate) => {
    return await productModal.getAllProduct(search,page , size ,startDate,endDate);
};

module.exports = {
    createProduct,
    findProductById,
    updateProduct,
    deleteProduct,
    getAllProduct,
};
