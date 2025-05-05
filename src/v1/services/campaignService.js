const CampaignModel = require('../models/CampaignModel');

const createCampaign = async (data) => {
  return await CampaignModel.createCampaign(data);
};

const findCampaignById = async (id) => {
  return await CampaignModel.findCampaignById(id);
};

// const findDealsByStatus = async (status) => {
//   return await CampaignModel.findDealsByStatus(status);
// };

const updateCampaign = async (id, data) => {
  return await CampaignModel.updateCampaign(id, data);
};

const deleteCampaign = async (id) => {
  return await CampaignModel.deleteCampaign(id);
};

const getAllCampaign = async ( page , size , search ,startDate,endDate ,status ,priority  ) => {
  return await CampaignModel.getAllCampaign( page , size , search ,startDate,endDate ,status ,priority  );
};

module.exports = {
  createCampaign,
  findCampaignById,
  updateCampaign,
  getAllCampaign,
  deleteCampaign,
};
