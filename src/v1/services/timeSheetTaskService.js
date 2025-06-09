const timeSheetTaskModel = require("../models/timeSheetTaskModel.js");

const createTimesheetTask = async (data) => {
  return await timeSheetTaskModel.createTimesheetTask(data);
};

const findTimesheetTaskById = async (id) => {
  return await timeSheetTaskModel.findTimesheetTaskById(id);
};

const updateTimesheetTask = async (id, data) => {
  return await timeSheetTaskModel.updateTimesheetTask(id, data);
};

const deleteTimesheetTask = async (id) => {
  return await timeSheetTaskModel.deleteTimesheetTask(id);
};

const getAllTimesheetTask = async (search, page, size, startDate, endDate) => {
  return await timeSheetTaskModel.getAllTimesheetTask(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createTimesheetTask,
  findTimesheetTaskById,
  updateTimesheetTask,
  deleteTimesheetTask,
  getAllTimesheetTask,
};
