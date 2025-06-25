const interviewStageRemarkModel = require("../models/interviewStageRemarkModel.js");

const createInterviewStageRemark = async (data) => {
  return await interviewStageRemarkModel.createInterviewStageRemark(data);
};

const findInterviewStageRemarkById = async (id) => {
  return await interviewStageRemarkModel.findInterviewStageRemarkById(id);
};

const updateInterviewStageRemark = async (id, data) => {
  return await interviewStageRemarkModel.updateInterviewStageRemark(id, data);
};

const deleteInterviewStageRemark = async (id) => {
  return await interviewStageRemarkModel.deleteInterviewStageRemark(id);
};

const getAllInterviewStageRemark = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await interviewStageRemarkModel.getAllInterviewStageRemark(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createInterviewStageRemark,
  findInterviewStageRemarkById,
  updateInterviewStageRemark,
  deleteInterviewStageRemark,
  getAllInterviewStageRemark,
};
