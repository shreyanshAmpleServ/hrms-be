const applicationSourceModel = require("../models/applicationSourceModel.js");

const createApplicationSource = async (data) => {
  return await applicationSourceModel.createApplicationSource(data);
};

const findApplicationSourceById = async (id) => {
  return await applicationSourceModel.findApplicationSourceById(id);
};

const updateApplicationSource = async (id, data) => {
  return await applicationSourceModel.updateApplicationSource(id, data);
};

const deleteApplicationSource = async (id) => {
  return await applicationSourceModel.deleteApplicationSource(id);
};

const getAllApplicationSource = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await applicationSourceModel.getAllApplicationSource(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createApplicationSource,
  findApplicationSourceById,
  updateApplicationSource,
  deleteApplicationSource,
  getAllApplicationSource,
};
