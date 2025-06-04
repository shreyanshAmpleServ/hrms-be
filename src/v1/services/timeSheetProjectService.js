const timeSheetProjectModel = require("../models/timeSheetProjectModel.js");

const createTimeSheetProject = async (data) => {
  return await timeSheetProjectModel.createTimeSheetProject(data);
};

const findTimeSheetProjectById = async (id) => {
  return await timeSheetProjectModel.findTimeSheetProjectById(id);
};

const updateTimeSheetProject = async (id, data) => {
  return await timeSheetProjectModel.updateTimeSheetProject(id, data);
};

const deleteTimeSheetProject = async (id) => {
  return await timeSheetProjectModel.deleteTimeSheetProject(id);
};

const getAllTimeSheetProject = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await timeSheetProjectModel.getAllTimeSheetProjects(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createTimeSheetProject,
  findTimeSheetProjectById,
  updateTimeSheetProject,
  deleteTimeSheetProject,
  getAllTimeSheetProject,
};
