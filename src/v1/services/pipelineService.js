const pipelineModel = require('../models/pipelineModal');

const createPipeline = async (data) => {
  return await pipelineModel.createPipeline(data);
};
const createPipelineWithStages = async (data) => {
  return await pipelineModel.createPipelineWithStages(data);
};

const findPipelineById = async (id) => {
  return await pipelineModel.findPipelineById(id);
};

const updatePipeline = async (id, data) => {
  return await pipelineModel.updatePipeline(id, data);
};

const deletePipeline = async (id) => {
  return await pipelineModel.deletePipeline(id);
};

const getAllPipelines = async (page , size , search ,startDate,endDate ,status  ) => {
  return await pipelineModel.getAllPipelines(page , size , search ,startDate,endDate ,status  );
};

const getPipelineDataWithDeals = async (pipelineId) => {
  return await pipelineModel.getPipelineDataWithDeals(pipelineId);
};
const updateDealStage = async (dealId, data) => {
  return await pipelineModel.updateDealStage(dealId,data);
};


module.exports = {
  createPipeline,
  createPipelineWithStages,
  findPipelineById,
  updatePipeline,
  deletePipeline,
  getAllPipelines,
  getPipelineDataWithDeals,
  updateDealStage
};
