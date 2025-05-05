const purchaseInvoiceModal = require('../models/purchaseInvoiceModal');

const createPurchaseInvoice = async (orderData,orderItemsData) => {
    return await purchaseInvoiceModal.createPurchaseInvoice(orderData,orderItemsData);
};

const findPurchaseInvoiceById = async (id) => {
    return await purchaseInvoiceModal.findPurchaseInvoiceById(id);
};

const updatePurchaseInvoice = async (id, orderData,orderItemsData) => {
    return await purchaseInvoiceModal.updatePurchaseInvoice(id, orderData,orderItemsData);
};

const deletePurchaseInvoice = async (id) => {
    return await purchaseInvoiceModal.deletePurchaseInvoice(id);
};

const getAllPurchaseInvoice = async (search,page , size ,startDate, endDate) => {
    return await purchaseInvoiceModal.getAllPurchaseInvoice(search,page , size ,startDate, endDate);
};
const generatePurchaseInvoiceCode = async () => {
    return await purchaseInvoiceModal.generatePurchaseInvoiceCode();
};

module.exports = {
    createPurchaseInvoice,
    updatePurchaseInvoice,
    deletePurchaseInvoice,
    getAllPurchaseInvoice,
    findPurchaseInvoiceById,
    generatePurchaseInvoiceCode
};
