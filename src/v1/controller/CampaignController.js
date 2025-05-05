const campaignService = require('../services/campaignService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment");

const createCampaign = async (req, res, next) => {
  try {
    const deal = await campaignService.createCampaign(req.body);
    res.status(201).success('Campaign created successfully', deal);
  } catch (error) {
    next(error);
  }
};

const findCampaignById = async (req, res, next) => {
  try {
    const deal = await campaignService.findCampaignById(req.params.id);
    if (!deal) throw new CustomError('Campaign not found', 404);
    res.status(200).success(null, deal);
  } catch (error) {
    next(error);
  }
};

const updateCampaign = async (req, res, next) => {
  try {
    const deal = await campaignService.updateCampaign(req.params.id, req.body);
    res.status(200).success('Campaign updated successfully', deal);
  } catch (error) {
    next(error);
  }
};

const deleteCampaign = async (req, res, next) => {
  try {
    await campaignService.deleteCampaign(req.params.id);
    res.status(200).success('Campaign deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const getAllCampaign = async (req, res, next) => {
  try {
    const { page , size , search ,startDate,endDate ,status  } = req.query;
    const deals = await campaignService.getAllCampaign(Number(page), Number(size) ,search ,moment(startDate),moment(endDate), status);
    res.status(200).success(null, deals);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCampaign,
  findCampaignById,
  updateCampaign,
  deleteCampaign,
  getAllCampaign,
};