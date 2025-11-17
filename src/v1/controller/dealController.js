const dealService = require('../services/dealService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createDeal = async (req, res, next) => {
  try {
    const deal = await dealService.createDeal(req.body);
    res.status(201).success('Deal created successfully', deal);
  } catch (error) {
    next(error);
  }
};

const getDealById = async (req, res, next) => {
  try {
    const deal = await dealService.findDealById(req.params.id);
    if (!deal) throw new CustomError('Deal not found', 404);
    res.status(200).success(null, deal);
  } catch (error) {
    next(error);
  }
};

const updateDeal = async (req, res, next) => {
  try {
    const deal = await dealService.updateDeal(req.params.id, req.body);
    res.status(200).success('Deal updated successfully', deal);
  } catch (error) {
    next(error);
  }
};

const deleteDeal = async (req, res, next) => {
  try {
    await dealService.deleteDeal(req.params.id);
    res.status(200).success('Deal deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const getAllDeals = async (req, res, next) => {
  try {
    const { page , size , search ,startDate,endDate ,status ,priority  } = req.query;
    const deals = await dealService.getAllDeals(Number(page), Number(size) ,search ,moment(startDate),moment(endDate), status, priority);
    res.status(200).success(null, deals);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDeal,
  getDealById,
  updateDeal,
  deleteDeal,
  getAllDeals,
};