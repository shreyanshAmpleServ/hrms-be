const invoiceModal = require('../models/invoiceModal');

const createInvoice = async (orderData,orderItemsData) => {
    return await invoiceModal.createInvoice(orderData,orderItemsData);
};

const findInvoiceById = async (id) => {
    return await invoiceModal.findInvoiceById(id);
};

const updateInvoice = async (id, orderData,orderItemsData) => {
    return await invoiceModal.updateInvoice(id, orderData,orderItemsData);
};

const deleteInvoice = async (id) => {
    return await invoiceModal.deleteInvoice(id);
};

const getAllInvoice = async (search,page , size ,startDate, endDate) => {
    return await invoiceModal.getAllInvoice(search ,page , size ,startDate, endDate);
};
const generateInvoiceCode = async () => {
    return await invoiceModal.generateInvoiceCode();
};

module.exports = {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getAllInvoice,
    findInvoiceById,
    generateInvoiceCode
};
