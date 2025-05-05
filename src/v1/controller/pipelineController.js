const pipelineService = require('../services/pipelineService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment");

const createPipeline = async (req, res, next) => {
  try {
    const pipeline = await pipelineService.createPipelineWithStages(req.body);
    res.status(201).success('Pipeline created successfully', pipeline);
  } catch (error) {
    next(error);
  }
};

const getPipelineById = async (req, res, next) => {
  try {
    const pipeline = await pipelineService.findPipelineById(req.params.id);
    if (!pipeline) throw new CustomError('Pipeline not found', 404);
    res.status(200).success(null, pipeline);
  } catch (error) {
    next(error);
  }
};

const updatePipeline = async (req, res, next) => {
  try {
    const pipeline = await pipelineService.updatePipeline(req.params.id, req.body);
    res.status(200).success('Pipeline updated successfully', pipeline);
  } catch (error) {
    next(error);
  }
};
const updateDealStage = async (req, res, next) => {
  try {
    const pipelineDealStage = await pipelineService.updateDealStage(req.params.dealId, req.body);
    res.status(200).success('Deal stage updated successfully', pipelineDealStage);
  } catch (error) {
    next(error);
  }
};

const deletePipeline = async (req, res, next) => {
  try {
    await pipelineService.deletePipeline(req.params.id);
    res.status(200).success('Pipeline deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const getAllPipelines = async (req, res, next) => {
  try {
    const { page , size , search ,startDate,endDate ,status   } = req.query;
    const pipelines = await pipelineService.getAllPipelines(Number(page), Number(size) ,search ,moment(startDate),moment(endDate), status);
    res.status(200).success(null, pipelines);
  } catch (error) {
    next(error);
  }
};

const getPipelineDataWithDeals = async (req, res, next) => {
  try {
    const pipelineData = await pipelineService.getPipelineDataWithDeals(req.params.id);
    if (!pipelineData) throw new CustomError('Pipeline data not found', 404);
    res.status(200).success(null, pipelineData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPipeline,
  getPipelineById,
  updatePipeline,
  deletePipeline,
  getAllPipelines,
  getPipelineDataWithDeals,
  updateDealStage
};
