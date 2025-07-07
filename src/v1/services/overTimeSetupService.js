const overTimeSetupModel = require("../models/overTimeSetupModel.js");

const createOverTimeSetup = async (data) => {
  return await overTimeSetupModel.createOverTimeSetup(data);
};

const findOverTimeSetupById = async (id) => {
  return await overTimeSetupModel.findOverTimeSetupById(id);
};

const updateOverTimeSetup = async (id, data) => {
  return await overTimeSetupModel.updateOverTimeSetup(id, data);
};

const deleteOverTimeSetup = async (id) => {
  return await overTimeSetupModel.deleteOverTimeSetup(id);
};
//comment

const getAllOverTimeSetup = async (search, page, size, startDate, endDate) => {
  return await overTimeSetupModel.getAllOverTimeSetup(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createOverTimeSetup,
  findOverTimeSetupById,
  updateOverTimeSetup,
  deleteOverTimeSetup,
  getAllOverTimeSetup,
};
