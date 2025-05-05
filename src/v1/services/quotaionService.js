const quotationModal = require('../models/quotationModal');

const createQuotation = async (orderData,orderItemsData) => {
    return await quotationModal.createQuotation(orderData,orderItemsData);
};

const findQuotationById = async (id) => {
    return await quotationModal.findQuotationById(id);
};

const updateQuotaion = async (id, orderData,orderItemsData) => {
    return await quotationModal.updateQuotaion(id, orderData,orderItemsData);
};

const deleteQuotation = async (id) => {
    return await quotationModal.deleteQuotation(id);
};

const getAllQuotaion = async (search,page , size ,startDate, endDate) => {
    return await quotationModal.getAllQuotaion(search,page , size ,startDate, endDate);
};
const generateQuotaionCode = async () => {
    return await quotationModal.generateQuotaionCode();
};

module.exports = {
  createQuotation,
  findQuotationById,
  updateQuotaion,
  deleteQuotation,
  getAllQuotaion,
  generateQuotaionCode
};
