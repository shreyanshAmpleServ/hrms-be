const orderModal = require('../models/orderModal');

const createOrder = async (orderData,orderItemsData) => {
    return await orderModal.createOrder(orderData,orderItemsData);
};

const findOrderById = async (id) => {
    return await orderModal.findOrderById(id);
};

const updateOrder = async (id, orderData,orderItemsData) => {
    return await orderModal.updateOrder(id, orderData,orderItemsData);
};

const deleteOrder = async (id) => {
    return await orderModal.deleteOrder(id);
};

const getAllOrder = async (search ,page , size ,startDate, endDate) => {
    return await orderModal.getAllOrder(search,page , size ,startDate, endDate);
};
const getSalesType = async () => {
    return await orderModal.getSalesType();
};
const generateOrderCode = async () => {
    return await orderModal.generateOrderCode();
};

module.exports = {
    createOrder,
    findOrderById,
    updateOrder,
    deleteOrder,
    getAllOrder,
    getSalesType,
    generateOrderCode
};
