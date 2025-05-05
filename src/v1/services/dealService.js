const dealModel = require('../models/dealModel');

const createDeal = async (data) => {
  return await dealModel.createDeal(data);
};

const findDealById = async (id) => {
  return await dealModel.findDealById(id);
};

const findDealsByStatus = async (status) => {
  return await dealModel.findDealsByStatus(status);
};

const updateDeal = async (id, data) => {
  return await dealModel.updateDeal(id, data);
};

const deleteDeal = async (id) => {
  return await dealModel.deleteDeal(id);
};

const getAllDeals = async ( page , size , search ,startDate,endDate ,status ,priority  ) => {
  return await dealModel.getAllDeals( page , size , search ,startDate,endDate ,status ,priority  );
};

module.exports = {
  createDeal,
  findDealById,
  findDealsByStatus,
  updateDeal,
  deleteDeal,
  getAllDeals,
};
