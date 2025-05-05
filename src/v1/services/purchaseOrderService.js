const purchaseOrderModal = require('../models/purchaseOrderModal');

const createPurchaseOrder = async (orderData,orderItemsData) => {
    return await purchaseOrderModal.createPurchaseOrder(orderData,orderItemsData);
};

const findPurchaseOrderById = async (id) => {
    return await purchaseOrderModal.findPurchaseOrderById(id);
};

const updatePurchaseOrder = async (id, orderData,orderItemsData) => {
    return await purchaseOrderModal.updatePurchaseOrder(id, orderData,orderItemsData);
};

const deletePurchaseOrder = async (id) => {
    return await purchaseOrderModal.deletePurchaseOrder(id);
};

const getAllPurchaseOrder = async (search,page , size ,startDate, endDate) => {
    return await purchaseOrderModal.getAllPurchaseOrder(search,page , size ,startDate, endDate);
};
const generatePurchaseOrderCode = async () => {
    return await purchaseOrderModal.generatePurchaseOrderCode();
};

module.exports = {
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getAllPurchaseOrder,
    findPurchaseOrderById,
    generatePurchaseOrderCode
};
